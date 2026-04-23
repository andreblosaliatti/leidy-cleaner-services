package br.com.leidycleaner.pagamentos.gateway;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.asaas")
public class AsaasProperties {

    private String baseUrl = "https://sandbox.asaas.com/api";
    private String apiKey;
    private String defaultCustomerId;
    private String checkoutSuccessUrl = "http://localhost:5173/pagamento/sucesso";
    private String checkoutCancelUrl = "http://localhost:5173/pagamento/cancelado";
    private String checkoutExpiredUrl = "http://localhost:5173/pagamento/expirado";

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getDefaultCustomerId() {
        return defaultCustomerId;
    }

    public void setDefaultCustomerId(String defaultCustomerId) {
        this.defaultCustomerId = defaultCustomerId;
    }

    public String getCheckoutSuccessUrl() {
        return checkoutSuccessUrl;
    }

    public void setCheckoutSuccessUrl(String checkoutSuccessUrl) {
        this.checkoutSuccessUrl = checkoutSuccessUrl;
    }

    public String getCheckoutCancelUrl() {
        return checkoutCancelUrl;
    }

    public void setCheckoutCancelUrl(String checkoutCancelUrl) {
        this.checkoutCancelUrl = checkoutCancelUrl;
    }

    public String getCheckoutExpiredUrl() {
        return checkoutExpiredUrl;
    }

    public void setCheckoutExpiredUrl(String checkoutExpiredUrl) {
        this.checkoutExpiredUrl = checkoutExpiredUrl;
    }
}
