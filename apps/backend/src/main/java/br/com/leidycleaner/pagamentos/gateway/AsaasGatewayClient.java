package br.com.leidycleaner.pagamentos.gateway;

public interface AsaasGatewayClient {

    @Deprecated(forRemoval = false)
    AsaasPagamentoGatewayResponse criarCobranca(AsaasCobrancaRequest request);

    AsaasPagamentoGatewayResponse consultarPagamento(String gatewayPaymentId);

    AsaasCheckoutGatewayResponse criarCheckout(AsaasCheckoutRequest request);
}
