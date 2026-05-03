package br.com.leidycleaner.configuracoes.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ConfiguracaoPrecoDto(
        Long id,
        BigDecimal valorHora,
        BigDecimal percentualComissaoAgencia,
        BigDecimal percentualEstimadoProfissional,
        boolean ativo,
        OffsetDateTime atualizadoEm
) {
}
