package br.com.leidycleaner.notificacoes.provider;

import java.util.Map;

public record PushNotificationPayload(
        String titulo,
        String mensagem,
        Map<String, String> dados
) {
}
