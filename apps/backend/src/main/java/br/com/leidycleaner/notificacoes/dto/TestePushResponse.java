package br.com.leidycleaner.notificacoes.dto;

public record TestePushResponse(
        boolean providerConfigurado,
        int totalDispositivos,
        int enviados,
        String mensagem
) {
}
