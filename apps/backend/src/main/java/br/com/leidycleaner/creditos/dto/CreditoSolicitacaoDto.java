package br.com.leidycleaner.creditos.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import br.com.leidycleaner.creditos.entity.StatusCreditoSolicitacao;
import br.com.leidycleaner.solicitacoes.entity.TipoServico;

public record CreditoSolicitacaoDto(
        Long id,
        StatusCreditoSolicitacao status,
        TipoServico tipoServico,
        int duracaoEstimadaHoras,
        Long regiaoId,
        String regiaoNome,
        Long solicitacaoOrigemId,
        Long solicitacaoUsoId,
        OffsetDateTime criadoEm,
        OffsetDateTime utilizadoEm,
        BigDecimal valorReferencia
) {
}
