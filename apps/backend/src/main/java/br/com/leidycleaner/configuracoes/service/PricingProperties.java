package br.com.leidycleaner.configuracoes.service;

import java.math.BigDecimal;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.pricing")
public class PricingProperties {

    private BigDecimal hourlyRate = new BigDecimal("45.00");
    private BigDecimal agencyCommissionPercent = new BigDecimal("20.00");

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getAgencyCommissionPercent() {
        return agencyCommissionPercent;
    }

    public void setAgencyCommissionPercent(BigDecimal agencyCommissionPercent) {
        this.agencyCommissionPercent = agencyCommissionPercent;
    }
}
