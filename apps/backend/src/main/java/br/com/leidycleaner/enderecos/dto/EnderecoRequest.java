package br.com.leidycleaner.enderecos.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EnderecoRequest(
        @NotBlank String cep,
        @NotBlank @Size(max = 180) String logradouro,
        @NotBlank @Size(max = 30) String numero,
        @Size(max = 120) String complemento,
        @NotBlank @Size(max = 120) String bairro,
        @NotBlank @Size(max = 120) String cidade,
        @NotBlank @Size(min = 2, max = 2) String estado,
        BigDecimal latitude,
        BigDecimal longitude,
        Boolean principal
) {
}
