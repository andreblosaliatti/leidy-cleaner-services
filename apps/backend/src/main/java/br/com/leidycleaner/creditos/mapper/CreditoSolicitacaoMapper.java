package br.com.leidycleaner.creditos.mapper;

import br.com.leidycleaner.creditos.dto.CreditoSolicitacaoDto;
import br.com.leidycleaner.creditos.entity.CreditoSolicitacao;

public final class CreditoSolicitacaoMapper {

    private CreditoSolicitacaoMapper() {
    }

    public static CreditoSolicitacaoDto paraDto(CreditoSolicitacao credito) {
        return new CreditoSolicitacaoDto(
                credito.getId(),
                credito.getStatus(),
                credito.getTipoServico(),
                credito.getDuracaoEstimadaHoras(),
                credito.getRegiao().getId(),
                credito.getRegiao().getNome(),
                credito.getSolicitacaoOrigem().getId(),
                credito.getSolicitacaoUso() != null ? credito.getSolicitacaoUso().getId() : null,
                credito.getCriadoEm(),
                credito.getUtilizadoEm(),
                credito.getValorReferencia()
        );
    }
}
