package br.com.leidycleaner.convites.dto;

import br.com.leidycleaner.atendimentos.entity.StatusAtendimento;
import br.com.leidycleaner.convites.entity.StatusConvite;
import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;

public record ConviteRespostaDto(
        Long conviteId,
        StatusConvite conviteStatus,
        Long solicitacaoId,
        StatusSolicitacao solicitacaoStatus,
        Long atendimentoId,
        StatusAtendimento atendimentoStatus
) {
}
