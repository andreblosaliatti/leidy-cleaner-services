package br.com.leidycleaner.solicitacoes.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import br.com.leidycleaner.solicitacoes.entity.TipoServico;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record SolicitacaoFaxinaRequest(
        @NotNull Long enderecoId,
        Long regiaoId,
        @NotNull @Future OffsetDateTime dataHoraDesejada,
        @Positive int duracaoEstimadaHoras,
        @NotNull TipoServico tipoServico,
        String observacoes,
        @PositiveOrZero BigDecimal valorServico,
        @PositiveOrZero BigDecimal percentualComissaoAgencia,
        @PositiveOrZero BigDecimal valorEstimadoProfissional
) {
}
