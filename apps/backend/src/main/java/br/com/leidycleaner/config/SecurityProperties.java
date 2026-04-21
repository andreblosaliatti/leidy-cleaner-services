package br.com.leidycleaner.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(String[] publicEndpoints) {

    public SecurityProperties {
        if (publicEndpoints == null || publicEndpoints.length == 0) {
            publicEndpoints = new String[] {"/api/v1/health"};
        }
    }
}
