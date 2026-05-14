package br.com.leidycleaner.convites.service;

import br.com.leidycleaner.convites.entity.StatusConvite;
import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;

public record ConviteExpiracaoResultado(
        Long conviteId,
        Long solicitacaoId,
        Long profissionalId,
        Long pagamentoId,
        boolean processado,
        boolean creditoGerado,
        StatusConvite statusConviteFinal,
        StatusSolicitacao statusSolicitacaoFinal,
        String motivo
) {

    public static ConviteExpiracaoResultado processado(
            Long conviteId,
            Long solicitacaoId,
            Long profissionalId,
            Long pagamentoId,
            boolean creditoGerado,
            StatusConvite statusConviteFinal,
            StatusSolicitacao statusSolicitacaoFinal,
            String motivo
    ) {
        return new ConviteExpiracaoResultado(
                conviteId,
                solicitacaoId,
                profissionalId,
                pagamentoId,
                true,
                creditoGerado,
                statusConviteFinal,
                statusSolicitacaoFinal,
                motivo
        );
    }

    public static ConviteExpiracaoResultado ignorado(
            Long conviteId,
            Long solicitacaoId,
            Long profissionalId,
            Long pagamentoId,
            StatusConvite statusConviteFinal,
            StatusSolicitacao statusSolicitacaoFinal,
            String motivo
    ) {
        return new ConviteExpiracaoResultado(
                conviteId,
                solicitacaoId,
                profissionalId,
                pagamentoId,
                false,
                false,
                statusConviteFinal,
                statusSolicitacaoFinal,
                motivo
        );
    }
}
