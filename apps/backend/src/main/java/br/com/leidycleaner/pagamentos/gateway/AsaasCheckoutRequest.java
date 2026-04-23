package br.com.leidycleaner.pagamentos.gateway;

import java.math.BigDecimal;
import java.util.List;

public record AsaasCheckoutRequest(
        Long atendimentoId,
        BigDecimal valor,
        String descricao
) {
}
