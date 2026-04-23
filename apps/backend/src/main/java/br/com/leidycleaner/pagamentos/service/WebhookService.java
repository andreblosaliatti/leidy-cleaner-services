package br.com.leidycleaner.pagamentos.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.atendimentos.repository.AtendimentoFaxinaRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.pagamentos.entity.Pagamento;
import br.com.leidycleaner.pagamentos.repository.PagamentoRepository;
import org.springframework.http.HttpStatus;

@Service
public class WebhookService {

    private final PagamentoRepository pagamentoRepository;
    private final AtendimentoFaxinaRepository atendimentoFaxinaRepository;
    private final ObjectMapper objectMapper;

    public WebhookService(
            PagamentoRepository pagamentoRepository,
            AtendimentoFaxinaRepository atendimentoFaxinaRepository,
            ObjectMapper objectMapper
    ) {
        this.pagamentoRepository = pagamentoRepository;
        this.atendimentoFaxinaRepository = atendimentoFaxinaRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void processarWebhookAsaas(String payload) {
        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            String event = jsonNode.path("event").asText();

            switch (event) {
                case "PAYMENT_RECEIVED", "PAYMENT_CONFIRMED" -> {
                    String paymentId = jsonNode.path("payment").path("id").asText();
                    processarPagamentoRecebido(paymentId);
                }
                case "CHECKOUT_PAID" -> {
                    String checkoutId = jsonNode.path("checkout").path("id").asText();
                    processarCheckoutPago(checkoutId);
                }
                default -> {
                    // Outros eventos podem ser ignorados ou logados
                }
            }
        } catch (BusinessException exception) {
            throw exception;
        } catch (JsonProcessingException exception) {
            throw new BusinessException(
                    "WEBHOOK_PAYLOAD_INVALIDO",
                    "Payload de webhook invalido",
                    HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            throw new BusinessException(
                    "WEBHOOK_PROCESSAMENTO_ERRO",
                    "Erro ao processar webhook: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private void processarPagamentoRecebido(String paymentId) {
        Pagamento pagamento = pagamentoRepository.findByGatewayPaymentId(paymentId)
                .orElseThrow(() -> new BusinessException("PAGAMENTO_NOT_FOUND", "Pagamento nao encontrado para gatewayPaymentId: " + paymentId, HttpStatus.NOT_FOUND));

        if (pagamento.isWebhookProcessado()) {
            return; // Ja processado
        }

        pagamento.confirmarViaWebhook();
        atualizarStatusAtendimento(pagamento.getAtendimento());
    }

    private void processarCheckoutPago(String checkoutId) {
        Pagamento pagamento = pagamentoRepository.findByGatewayPaymentId(checkoutId)
                .orElseThrow(() -> new BusinessException("PAGAMENTO_NOT_FOUND", "Pagamento nao encontrado para checkoutId: " + checkoutId, HttpStatus.NOT_FOUND));

        if (pagamento.isWebhookProcessado()) {
            return; // Ja processado
        }

        pagamento.confirmarViaWebhook();
        atualizarStatusAtendimento(pagamento.getAtendimento());
    }

    private void atualizarStatusAtendimento(AtendimentoFaxina atendimento) {
        atendimento.confirmarPagamento();
        atendimentoFaxinaRepository.save(atendimento);
    }
}
