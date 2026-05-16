package br.com.leidycleaner.notificacoes.provider;

import br.com.leidycleaner.notificacoes.entity.PlataformaPush;

public record EnviarPushCommand(
        Long usuarioId,
        PlataformaPush plataforma,
        String token,
        PushNotificationPayload payload
) {
}
