package br.com.leidycleaner.creditos.dto;

import br.com.leidycleaner.convites.entity.StatusConvite;
import br.com.leidycleaner.creditos.entity.StatusCreditoSolicitacao;
import br.com.leidycleaner.pagamentos.entity.StatusPagamento;
import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;

public record UsoCreditoSolicitacaoDto(
        Long creditoSolicitacaoId,
        StatusCreditoSolicitacao creditoStatus,
        Long solicitacaoId,
        StatusSolicitacao solicitacaoStatus,
        Long pagamentoId,
        StatusPagamento pagamentoStatus,
        Long conviteId,
        StatusConvite conviteStatus
) {
}
