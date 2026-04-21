package br.com.leidycleaner.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequest(
        @NotBlank(message = "email e obrigatorio")
        @Email(message = "email deve ser valido")
        String email,

        @NotBlank(message = "senha e obrigatoria")
        String senha
) {
}
