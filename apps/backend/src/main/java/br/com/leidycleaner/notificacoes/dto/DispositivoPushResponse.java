package br.com.leidycleaner.notificacoes.dto;

import java.time.OffsetDateTime;

import br.com.leidycleaner.notificacoes.entity.PlataformaPush;

public record DispositivoPushResponse(
        Long id,
        Long usuarioId,
        PlataformaPush plataforma,
        String tokenMascarado,
        boolean ativo,
        OffsetDateTime ultimoUsoEm,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
