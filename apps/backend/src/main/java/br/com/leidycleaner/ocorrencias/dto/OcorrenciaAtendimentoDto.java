package br.com.leidycleaner.ocorrencias.dto;

import java.time.OffsetDateTime;

import br.com.leidycleaner.ocorrencias.entity.StatusOcorrencia;
import br.com.leidycleaner.ocorrencias.entity.TipoOcorrencia;

public record OcorrenciaAtendimentoDto(
        Long id,
        Long atendimentoId,
        Long abertoPorUsuarioId,
        TipoOcorrencia tipo,
        String descricao,
        StatusOcorrencia status,
        OffsetDateTime resolvidoEm,
        Long resolvidoPorUsuarioId,
        OffsetDateTime criadoEm
) {
}
