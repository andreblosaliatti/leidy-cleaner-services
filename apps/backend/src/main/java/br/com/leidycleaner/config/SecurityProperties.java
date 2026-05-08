package br.com.leidycleaner.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
        String[] publicEndpoints,
        String[] corsAllowedOriginPatterns
) {

    public SecurityProperties {
        if (publicEndpoints == null || publicEndpoints.length == 0) {
            publicEndpoints = new String[] {"/api/v1/health"};
        }

        if (corsAllowedOriginPatterns == null || corsAllowedOriginPatterns.length == 0) {
            corsAllowedOriginPatterns = new String[] {
                    "http://localhost:*",
                    "http://127.0.0.1:*",
                    "http://172.*.*.*:5173"
            };
        }
    }
}
