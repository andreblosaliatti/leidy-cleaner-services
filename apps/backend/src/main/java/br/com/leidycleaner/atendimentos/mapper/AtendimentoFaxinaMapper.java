package br.com.leidycleaner.atendimentos.mapper;

import br.com.leidycleaner.atendimentos.dto.AtendimentoFaxinaDto;
import br.com.leidycleaner.atendimentos.dto.CheckpointServicoDto;
import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.atendimentos.entity.CheckpointServico;

public final class AtendimentoFaxinaMapper {

    private AtendimentoFaxinaMapper() {
    }

    public static AtendimentoFaxinaDto paraDto(AtendimentoFaxina atendimento) {
        return new AtendimentoFaxinaDto(
                atendimento.getId(),
                atendimento.getSolicitacao().getId(),
                atendimento.getCliente().getId(),
                atendimento.getProfissional().getId(),
                atendimento.getStatus(),
                atendimento.getSolicitacao().getTipoServico(),
                atendimento.getValorServico(),
                atendimento.getValorEstimadoProfissional(),
                atendimento.getInicioPrevistoEm(),
                atendimento.getInicioRealEm(),
                atendimento.getFimRealEm(),
                atendimento.getCriadoEm(),
                atendimento.getAtualizadoEm()
        );
    }

    public static CheckpointServicoDto paraDto(CheckpointServico checkpoint) {
        return new CheckpointServicoDto(
                checkpoint.getId(),
                checkpoint.getAtendimento().getId(),
                checkpoint.getTipo(),
                checkpoint.getRegistradoPor().getId(),
                checkpoint.getLatitude(),
                checkpoint.getLongitude(),
                checkpoint.getFotoComprovacaoUrl(),
                checkpoint.getObservacao(),
                checkpoint.getRegistradoEm()
        );
    }
}
