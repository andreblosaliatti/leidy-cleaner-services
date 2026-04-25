package br.com.leidycleaner.ocorrencias.dto;

import br.com.leidycleaner.ocorrencias.entity.StatusOcorrencia;
import jakarta.validation.constraints.NotNull;

public record AtualizarStatusOcorrenciaRequest(
        @NotNull StatusOcorrencia status
) {
}
