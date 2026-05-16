package br.com.leidycleaner.notificacoes.provider;

public record PushNotificationResult(
        boolean enviado,
        String codigo,
        String mensagem
) {
}
