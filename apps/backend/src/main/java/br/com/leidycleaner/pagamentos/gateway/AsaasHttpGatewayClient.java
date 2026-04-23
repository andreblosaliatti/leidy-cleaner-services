package br.com.leidycleaner.pagamentos.gateway;

import java.time.Clock;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;

import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.pagamentos.entity.MetodoPagamento;

@Service
public class AsaasHttpGatewayClient implements AsaasGatewayClient {

    private final AsaasProperties properties;
    private final RestClient restClient;
    private final Clock clock;

    public AsaasHttpGatewayClient(AsaasProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.clock = Clock.systemDefaultZone();
    }

    @Override
    @Deprecated(forRemoval = false)
    public AsaasPagamentoGatewayResponse criarCobranca(AsaasCobrancaRequest request) {
        validarConfiguracaoCobranca();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("customer", properties.getDefaultCustomerId());
        body.put("billingType", paraBillingType(request.metodoPagamento()));
        body.put("value", request.valor());
        body.put("dueDate", LocalDate.now(clock).plusDays(1).toString());
        body.put("description", request.descricao());
        body.put("externalReference", "atendimento-" + request.atendimentoId());

        JsonNode response = restClient.post()
                .uri("/v3/payments")
                .header("access_token", properties.getApiKey())
                .body(body)
                .retrieve()
                .body(JsonNode.class);
        return paraGatewayResponse(response);
    }

    @Override
    public AsaasCheckoutGatewayResponse criarCheckout(AsaasCheckoutRequest request) {
        validarConfiguracaoCheckout();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("billingTypes", List.of("PIX", "CREDIT_CARD", "BOLETO"));
        body.put("chargeTypes", List.of("DETACHED"));
        body.put("items", List.of(Map.of(
                "name", request.descricao(),
                "value", request.valor(),
                "quantity", 1
        )));
        body.put("successUrl", urlRetorno(properties.getCheckoutSuccessUrl(), request.atendimentoId()));
        body.put("cancelUrl", urlRetorno(properties.getCheckoutCancelUrl(), request.atendimentoId()));
        body.put("expiredUrl", urlRetorno(properties.getCheckoutExpiredUrl(), request.atendimentoId()));
        body.put("externalReference", "atendimento-" + request.atendimentoId());

        JsonNode response = restClient.post()
                .uri("/v3/checkouts")
                .header("access_token", properties.getApiKey())
                .body(body)
                .retrieve()
                .body(JsonNode.class);
        return paraCheckoutGatewayResponse(response);
    }

    @Override
    public AsaasPagamentoGatewayResponse consultarPagamento(String gatewayPaymentId) {
        validarConfiguracaoCheckout();
        JsonNode response = restClient.get()
                .uri("/v3/payments/{id}", gatewayPaymentId)
                .header("access_token", properties.getApiKey())
                .retrieve()
                .body(JsonNode.class);
        return paraGatewayResponse(response);
    }

    private void validarConfiguracaoCobranca() {
        validarConfiguracaoCheckout();
        if (properties.getDefaultCustomerId() == null || properties.getDefaultCustomerId().isBlank()) {
            throw new BusinessException(
                    "ASAAS_CONFIG_INVALIDA",
                    "Configuracao legada do Asaas incompleta",
                    HttpStatus.CONFLICT
            );
        }
    }

    private void validarConfiguracaoCheckout() {
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            throw new BusinessException(
                    "ASAAS_CONFIG_INVALIDA",
                    "Configuracao do Asaas incompleta",
                    HttpStatus.CONFLICT
            );
        }
        validarUrlRetorno(properties.getCheckoutSuccessUrl(), "ASAAS_CHECKOUT_SUCCESS_URL");
        validarUrlRetorno(properties.getCheckoutCancelUrl(), "ASAAS_CHECKOUT_CANCEL_URL");
        validarUrlRetorno(properties.getCheckoutExpiredUrl(), "ASAAS_CHECKOUT_EXPIRED_URL");
    }

    private String paraBillingType(MetodoPagamento metodoPagamento) {
        return switch (metodoPagamento) {
            case PIX -> "PIX";
            case BOLETO -> "BOLETO";
            case CARTAO_CREDITO -> "CREDIT_CARD";
        };
    }

    private AsaasPagamentoGatewayResponse paraGatewayResponse(JsonNode response) {
        if (response == null || response.path("id").asText(null) == null) {
            throw new BusinessException(
                    "ASAAS_RESPONSE_INVALIDA",
                    "Resposta invalida do Asaas",
                    HttpStatus.BAD_GATEWAY
            );
        }
        return new AsaasPagamentoGatewayResponse(
                response.path("id").asText(),
                response.path("status").asText(null),
                decimalOuNull(response.path("paymentFee")),
                decimalOuNull(response.path("netValue")),
                textoOuNull(response.path("invoiceUrl")),
                textoOuNull(response.path("pixTransaction").path("payload")),
                response.toString()
        );
    }

    private java.math.BigDecimal decimalOuNull(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        return node.decimalValue();
    }

    private String textoOuNull(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        String valor = node.asText();
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor;
    }

    private AsaasCheckoutGatewayResponse paraCheckoutGatewayResponse(JsonNode response) {
        if (response == null || response.path("id").asText(null) == null) {
            throw new BusinessException(
                    "ASAAS_CHECKOUT_RESPONSE_INVALIDA",
                    "Resposta invalida do Asaas para checkout",
                    HttpStatus.BAD_GATEWAY
            );
        }
        String checkoutId = response.path("id").asText();
        String checkoutUrl = "https://asaas.com/checkoutSession/show?id=" + checkoutId;
        return new AsaasCheckoutGatewayResponse(
                checkoutId,
                checkoutUrl,
                response.toString()
        );
    }

    private String urlRetorno(String urlBase, Long atendimentoId) {
        String separador = urlBase.contains("?") ? "&" : "?";
        return urlBase + separador + "atendimentoId=" + atendimentoId;
    }

    private void validarUrlRetorno(String url, String nomeConfiguracao) {
        if (url == null || url.isBlank()) {
            throw new BusinessException(
                    "ASAAS_CONFIG_INVALIDA",
                    nomeConfiguracao + " nao configurada",
                    HttpStatus.CONFLICT
            );
        }
    }
}
