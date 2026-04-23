package br.com.leidycleaner.pagamentos.mapper;

import br.com.leidycleaner.pagamentos.dto.PagamentoDto;
import br.com.leidycleaner.pagamentos.entity.Pagamento;

public final class PagamentoMapper {

    private PagamentoMapper() {
    }

    public static PagamentoDto paraDto(Pagamento pagamento) {
        return new PagamentoDto(
                pagamento.getId(),
                pagamento.getAtendimento().getId(),
                pagamento.getGateway(),
                pagamento.getGatewayPaymentId(),
                pagamento.getMetodoPagamento(),
                pagamento.getStatus(),
                pagamento.getValorBruto(),
                pagamento.getValorTaxaGateway(),
                pagamento.getValorLiquidoRecebido(),
                pagamento.getRecebidoEm(),
                pagamento.getUrlPagamento(),
                pagamento.getPixCopiaECola(),
                pagamento.isWebhookProcessado(),
                pagamento.getCriadoEm(),
                pagamento.getAtualizadoEm()
        );
    }
}
