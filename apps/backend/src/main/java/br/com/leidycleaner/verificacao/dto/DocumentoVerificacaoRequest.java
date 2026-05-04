package br.com.leidycleaner.verificacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DocumentoVerificacaoRequest(
        @NotBlank(message = "tipoDocumento e obrigatorio")
        @Size(max = 40, message = "tipoDocumento deve ter no maximo 40 caracteres")
        String tipoDocumento,

        @NotBlank(message = "numeroDocumento e obrigatorio")
        @Size(max = 80, message = "numeroDocumento deve ter no maximo 80 caracteres")
        String numeroDocumento,

        @Size(max = 4000000, message = "documentoFrenteUrl deve ter no maximo 4MB")
        String documentoFrenteUrl,

        @Size(max = 4000000, message = "documentoVersoUrl deve ter no maximo 4MB")
        String documentoVersoUrl,

        @Size(max = 4000000, message = "selfieUrl deve ter no maximo 4MB")
        String selfieUrl,

        @Size(max = 4000000, message = "comprovanteResidenciaUrl deve ter no maximo 4MB")
        String comprovanteResidenciaUrl
) {
}
