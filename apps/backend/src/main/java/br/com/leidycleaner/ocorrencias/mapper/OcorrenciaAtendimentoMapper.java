package br.com.leidycleaner.ocorrencias.mapper;

import br.com.leidycleaner.ocorrencias.dto.OcorrenciaAtendimentoDto;
import br.com.leidycleaner.ocorrencias.entity.OcorrenciaAtendimento;

public final class OcorrenciaAtendimentoMapper {

    private OcorrenciaAtendimentoMapper() {
    }

    public static OcorrenciaAtendimentoDto paraDto(OcorrenciaAtendimento ocorrencia) {
        return new OcorrenciaAtendimentoDto(
                ocorrencia.getId(),
                ocorrencia.getAtendimento().getId(),
                ocorrencia.getAbertoPor().getId(),
                ocorrencia.getTipo(),
                ocorrencia.getDescricao(),
                ocorrencia.getStatus(),
                ocorrencia.getResolvidoEm(),
                ocorrencia.getResolvidoPor() == null ? null : ocorrencia.getResolvidoPor().getId(),
                ocorrencia.getCriadoEm()
        );
    }
}
