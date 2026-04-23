package br.com.leidycleaner.pagamentos.gateway;

public record AsaasCheckoutGatewayResponse(
        String checkoutId,
        String checkoutUrl,
        String payloadResumo
) {
}