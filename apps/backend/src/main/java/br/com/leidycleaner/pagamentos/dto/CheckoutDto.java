package br.com.leidycleaner.pagamentos.dto;

import java.math.BigDecimal;

public record CheckoutDto(
        Long atendimentoId,
        String checkoutUrl,
        String paymentUrl,
        BigDecimal valor,
        String descricao
) {
}
