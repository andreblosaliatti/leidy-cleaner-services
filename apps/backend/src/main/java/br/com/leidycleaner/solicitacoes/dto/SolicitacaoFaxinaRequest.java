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
        @NotNull Long regiaoId,
        @NotNull @Future OffsetDateTime dataHoraDesejada,
        @Positive int duracaoEstimadaHoras,
        @NotNull TipoServico tipoServico,
        String observacoes,
        @NotNull @PositiveOrZero BigDecimal valorServico,
        @NotNull @PositiveOrZero BigDecimal percentualComissaoAgencia,
        @NotNull @PositiveOrZero BigDecimal valorEstimadoProfissional
) {
}
