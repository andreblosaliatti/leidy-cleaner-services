package br.com.leidycleaner.usuarios.dto;

import br.com.leidycleaner.usuarios.entity.StatusConta;
import jakarta.validation.constraints.NotNull;

public record AlterarStatusUsuarioRequest(
        @NotNull(message = "statusConta e obrigatorio")
        StatusConta statusConta
) {
}
