package br.com.leidycleaner.profissionais.dto;

import br.com.leidycleaner.profissionais.entity.StatusAprovacaoProfissional;
import jakarta.validation.constraints.NotNull;

public record AnalisarProfissionalRequest(
        @NotNull(message = "statusAprovacao e obrigatorio")
        StatusAprovacaoProfissional statusAprovacao
) {
}
