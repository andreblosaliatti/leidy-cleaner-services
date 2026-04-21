package br.com.leidycleaner.solicitacoes.dto;

import java.time.OffsetDateTime;

public record ProfissionalSelecionadoDto(
        Long id,
        Long profissionalId,
        int ordemEscolha,
        OffsetDateTime criadoEm
) {
}
