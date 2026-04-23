package br.com.leidycleaner.pagamentos.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import br.com.leidycleaner.pagamentos.entity.GatewayPagamento;
import br.com.leidycleaner.pagamentos.entity.MetodoPagamento;
import br.com.leidycleaner.pagamentos.entity.StatusPagamento;

public record PagamentoDto(
        Long id,
        Long atendimentoId,
        GatewayPagamento gateway,
        String gatewayPaymentId,
        MetodoPagamento metodoPagamento,
        StatusPagamento status,
        BigDecimal valorBruto,
        BigDecimal valorTaxaGateway,
        BigDecimal valorLiquidoRecebido,
        OffsetDateTime recebidoEm,
        String urlPagamento,
        String pixCopiaECola,
        boolean webhookProcessado,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
