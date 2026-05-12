package br.com.leidycleaner.pagamentos.gateway;

import java.math.BigDecimal;

import br.com.leidycleaner.pagamentos.entity.MetodoPagamento;

public record AsaasCobrancaRequest(
        String externalReference,
        String callbackParametroNome,
        Long callbackReferenciaId,
        MetodoPagamento metodoPagamento,
        BigDecimal valor,
        String descricao
) {

    public AsaasCobrancaRequest(
            Long atendimentoId,
            MetodoPagamento metodoPagamento,
            BigDecimal valor,
            String descricao
    ) {
        this(
                "atendimento-" + atendimentoId,
                "atendimentoId",
                atendimentoId,
                metodoPagamento,
                valor,
                descricao
        );
    }

    public static AsaasCobrancaRequest paraSolicitacao(
            Long solicitacaoId,
            MetodoPagamento metodoPagamento,
            BigDecimal valor,
            String descricao
    ) {
        return new AsaasCobrancaRequest(
                "solicitacao-" + solicitacaoId,
                "solicitacaoId",
                solicitacaoId,
                metodoPagamento,
                valor,
                descricao
        );
    }
}
