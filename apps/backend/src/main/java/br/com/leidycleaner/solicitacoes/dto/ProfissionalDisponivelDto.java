package br.com.leidycleaner.solicitacoes.dto;

import java.math.BigDecimal;

public record ProfissionalDisponivelDto(
        Long profissionalId,
        String nomeExibicao,
        String fotoPerfilUrl,
        int experienciaAnos,
        BigDecimal notaMedia,
        int totalAvaliacoes
) {
}
