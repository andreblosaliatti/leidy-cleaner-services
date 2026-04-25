package br.com.leidycleaner.avaliacoes.dto;

import java.time.OffsetDateTime;

public record AvaliacaoProfissionalDto(
        Long avaliacaoId,
        Long atendimentoId,
        Long profissionalId,
        int nota,
        String comentario,
        OffsetDateTime criadoEm
) {
}
