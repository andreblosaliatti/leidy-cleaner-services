package br.com.leidycleaner.ocorrencias.dto;

import br.com.leidycleaner.ocorrencias.entity.TipoOcorrencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OcorrenciaAtendimentoRequest(
        @NotNull Long atendimentoId,
        @NotNull TipoOcorrencia tipo,
        @NotBlank @Size(max = 2000) String descricao
) {
}
