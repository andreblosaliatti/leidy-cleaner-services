package br.com.leidycleaner.notificacoes.provider;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "false", matchIfMissing = true)
public class NoOpPushNotificationProvider implements PushNotificationProvider {

    @Override
    public boolean isConfigured() {
        return false;
    }

    @Override
    public PushNotificationResult enviar(EnviarPushCommand command) {
        return new PushNotificationResult(
                false,
                "PUSH_PROVIDER_NOT_CONFIGURED",
                "Provider de push ainda nao configurado"
        );
    }
}
