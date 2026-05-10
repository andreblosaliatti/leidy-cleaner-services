package br.com.leidycleaner.solicitacoes.dto;

import java.math.BigDecimal;

public record SolicitacaoPrecoPreviewDto(
        BigDecimal valorServico,
        BigDecimal percentualComissaoAgencia,
        BigDecimal valorEstimadoProfissional
) {
}
