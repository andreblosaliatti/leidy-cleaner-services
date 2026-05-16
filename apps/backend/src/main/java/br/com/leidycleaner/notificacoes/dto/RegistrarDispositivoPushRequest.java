package br.com.leidycleaner.notificacoes.dto;

import br.com.leidycleaner.notificacoes.entity.PlataformaPush;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistrarDispositivoPushRequest(
        @NotNull(message = "plataforma e obrigatoria")
        PlataformaPush plataforma,

        @NotBlank(message = "token e obrigatorio")
        @Size(max = 2048, message = "token deve ter no maximo 2048 caracteres")
        String token
) {
}
