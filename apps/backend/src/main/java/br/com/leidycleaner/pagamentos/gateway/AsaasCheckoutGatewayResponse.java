package br.com.leidycleaner.pagamentos.gateway;

import br.com.leidycleaner.pagamentos.entity.MetodoPagamento;

public record AsaasCheckoutGatewayResponse(
        String checkoutId,
        String checkoutUrl,
        MetodoPagamento metodoPagamento,
        String payloadResumo
) {
}
