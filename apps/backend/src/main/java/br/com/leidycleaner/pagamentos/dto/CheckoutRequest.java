package br.com.leidycleaner.pagamentos.dto;

import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotNull Long atendimentoId
) {
}