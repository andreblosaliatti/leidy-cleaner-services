package br.com.leidycleaner.solicitacoes.mapper;

import br.com.leidycleaner.solicitacoes.dto.SolicitacaoFaxinaDto;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;

public final class SolicitacaoFaxinaMapper {

    private SolicitacaoFaxinaMapper() {
    }

    public static SolicitacaoFaxinaDto paraDto(SolicitacaoFaxina solicitacao) {
        return new SolicitacaoFaxinaDto(
                solicitacao.getId(),
                solicitacao.getCliente().getId(),
                solicitacao.getEndereco().getId(),
                solicitacao.getRegiao().getId(),
                solicitacao.getDataHoraDesejada(),
                solicitacao.getDuracaoEstimadaHoras(),
                solicitacao.getTipoServico(),
                solicitacao.getObservacoes(),
                solicitacao.getValorServico(),
                solicitacao.getPercentualComissaoAgencia(),
                solicitacao.getValorEstimadoProfissional(),
                solicitacao.getStatus(),
                solicitacao.getCriadoEm(),
                solicitacao.getAtualizadoEm()
        );
    }
}
