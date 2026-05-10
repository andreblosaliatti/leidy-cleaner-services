package br.com.leidycleaner.solicitacoes.dto;

import br.com.leidycleaner.solicitacoes.entity.TipoServico;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SolicitacaoPrecoPreviewRequest(
        @Positive int duracaoEstimadaHoras,
        @NotNull TipoServico tipoServico
) {
}
