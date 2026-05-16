package br.com.leidycleaner.notificacoes.provider;

public interface PushNotificationProvider {

    boolean isConfigured();

    PushNotificationResult enviar(EnviarPushCommand command);
}
