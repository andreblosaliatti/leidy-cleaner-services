package br.com.leidycleaner.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroClienteRequest(
        @NotBlank(message = "nomeCompleto e obrigatorio")
        @Size(max = 160, message = "nomeCompleto deve ter no maximo 160 caracteres")
        String nomeCompleto,

        @NotBlank(message = "email e obrigatorio")
        @Email(message = "email deve ser valido")
        @Size(max = 255, message = "email deve ter no maximo 255 caracteres")
        String email,

        @NotBlank(message = "telefone e obrigatorio")
        @Size(max = 30, message = "telefone deve ter no maximo 30 caracteres")
        String telefone,

        @NotBlank(message = "senha e obrigatoria")
        @Size(min = 8, max = 120, message = "senha deve ter entre 8 e 120 caracteres")
        String senha,

        String observacoesInternas
) {
}
