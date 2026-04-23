package br.com.leidycleaner.pagamentos.dto;

import br.com.leidycleaner.pagamentos.entity.MetodoPagamento;
import jakarta.validation.constraints.NotNull;

public record PagamentoRequest(
        @NotNull Long atendimentoId,
        @NotNull MetodoPagamento metodoPagamento
) {
}
