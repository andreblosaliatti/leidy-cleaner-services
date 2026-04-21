package br.com.leidycleaner.verificacao.dto;

import br.com.leidycleaner.verificacao.entity.StatusVerificacao;
import jakarta.validation.constraints.NotNull;

public record AnalisarDocumentoVerificacaoRequest(
        @NotNull(message = "statusVerificacao e obrigatorio")
        StatusVerificacao statusVerificacao,

        String observacaoAnalise
) {
}
