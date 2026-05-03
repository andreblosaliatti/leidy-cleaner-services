package br.com.leidycleaner.configuracoes.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record ConfiguracaoPrecoUpdateRequest(
        @NotNull
        @DecimalMin(value = "0.01", message = "deve ser maior que zero")
        BigDecimal valorHora,

        @NotNull
        @DecimalMin(value = "0.00", message = "deve ser maior ou igual a zero")
        @DecimalMax(value = "100.00", message = "deve ser menor ou igual a 100")
        BigDecimal percentualComissaoAgencia
) {
}
