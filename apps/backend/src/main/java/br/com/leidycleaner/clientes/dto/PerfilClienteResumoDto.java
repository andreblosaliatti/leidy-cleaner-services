package br.com.leidycleaner.clientes.dto;

import java.time.OffsetDateTime;

public record PerfilClienteResumoDto(
        Long id,
        Long usuarioId,
        String observacoesInternas,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
