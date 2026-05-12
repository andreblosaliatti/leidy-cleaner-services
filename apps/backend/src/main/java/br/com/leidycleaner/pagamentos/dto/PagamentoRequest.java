package br.com.leidycleaner.pagamentos.dto;

import br.com.leidycleaner.pagamentos.entity.MetodoPagamento;
import jakarta.validation.constraints.NotNull;

public record PagamentoRequest(
        Long atendimentoId,
        Long solicitacaoId,
        @NotNull MetodoPagamento metodoPagamento
) {
}
