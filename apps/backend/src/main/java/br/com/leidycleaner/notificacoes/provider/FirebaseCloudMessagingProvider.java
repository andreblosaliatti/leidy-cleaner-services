package br.com.leidycleaner.notificacoes.provider;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

@Component
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true")
public class FirebaseCloudMessagingProvider implements PushNotificationProvider {

    private static final Logger log = LoggerFactory.getLogger(FirebaseCloudMessagingProvider.class);

    private final boolean enabled;
    private final FirebaseMessaging firebaseMessaging;

    public FirebaseCloudMessagingProvider(
            @Value("${firebase.enabled:false}") boolean enabled,
            @Value("${google.application.credentials:}") String credentialsPath
    ) {
        this.enabled = enabled;
        
        if (enabled) {
            try {
                this.firebaseMessaging = initializeFirebase(credentialsPath);
            } catch (IOException e) {
                log.error("Falha ao inicializar Firebase: {}", e.getMessage());
                throw new RuntimeException("Firebase initialization failed", e);
            }
        } else {
            this.firebaseMessaging = null;
        }
    }

    @Override
    public boolean isConfigured() {
        return enabled && firebaseMessaging != null;
    }

    @Override
    public PushNotificationResult enviar(EnviarPushCommand command) {
        if (!isConfigured()) {
            return new PushNotificationResult(
                    false,
                    "FIREBASE_NOT_CONFIGURED",
                    "Firebase ainda nao foi configurado"
            );
        }

        try {
            String token = command.token();
            PushNotificationPayload payload = command.payload();

            // Validate token
            if (token == null || token.trim().isEmpty()) {
                return new PushNotificationResult(
                        false,
                        "INVALID_TOKEN",
                        "Token de dispositivo invalido"
                );
            }

            // Build FCM message
            Map<String, String> dataMap = new HashMap<>(payload.dados());
            
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(
                            Notification.builder()
                                    .setTitle(payload.titulo())
                                    .setBody(payload.mensagem())
                                    .build()
                    )
                    .putAllData(dataMap)
                    .build();

            // Send via Firebase
            String messageId = firebaseMessaging.send(message);

            if (messageId != null && !messageId.trim().isEmpty()) {
                return new PushNotificationResult(
                        true,
                        "ENVIADO",
                        "Notificacao enviada com sucesso"
                );
            }

            return new PushNotificationResult(
                    false,
                    "ENVIO_FALHOU",
                    "Falha ao enviar notificacao via Firebase"
            );

        } catch (IllegalArgumentException e) {
            // Invalid token error
            log.warn("Token invalido ou nao registrado para Firebase: {}", e.getMessage());
            return new PushNotificationResult(
                    false,
                    "INVALID_OR_UNREGISTERED_TOKEN",
                    "Token invalido ou nao registrado"
            );
        } catch (Exception e) {
            // Catch generic exceptions from Firebase
            log.warn("Falha ao enviar push via Firebase: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            return new PushNotificationResult(
                    false,
                    "FIREBASE_ERROR",
                    "Falha ao enviar notificacao: " + e.getClass().getSimpleName()
            );
        }
    }

    private FirebaseMessaging initializeFirebase(String credentialsPath) throws IOException {
        if (credentialsPath == null || credentialsPath.trim().isEmpty()) {
            throw new IOException("GOOGLE_APPLICATION_CREDENTIALS nao foi configurado");
        }

        GoogleCredentials credentials;
        try (FileInputStream inputStream = new FileInputStream(credentialsPath)) {
            credentials = GoogleCredentials.fromStream(inputStream);
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

        FirebaseApp app;
        try {
            app = FirebaseApp.getInstance();
        } catch (IllegalStateException e) {
            app = FirebaseApp.initializeApp(options);
        }

        return FirebaseMessaging.getInstance(app);
    }
}
