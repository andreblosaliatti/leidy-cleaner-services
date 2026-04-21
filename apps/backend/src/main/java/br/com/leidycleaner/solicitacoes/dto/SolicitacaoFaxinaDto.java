package br.com.leidycleaner.solicitacoes.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;
import br.com.leidycleaner.solicitacoes.entity.TipoServico;

public record SolicitacaoFaxinaDto(
        Long id,
        Long clienteId,
        Long enderecoId,
        Long regiaoId,
        OffsetDateTime dataHoraDesejada,
        int duracaoEstimadaHoras,
        TipoServico tipoServico,
        String observacoes,
        BigDecimal valorServico,
        BigDecimal percentualComissaoAgencia,
        BigDecimal valorEstimadoProfissional,
        StatusSolicitacao status,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
