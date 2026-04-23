package br.com.leidycleaner.pagamentos.gateway;

import java.math.BigDecimal;

public record AsaasPagamentoGatewayResponse(
        String gatewayPaymentId,
        String statusGateway,
        BigDecimal valorTaxaGateway,
        BigDecimal valorLiquidoRecebido,
        String urlPagamento,
        String pixCopiaECola,
        String payloadResumo
) {
}
