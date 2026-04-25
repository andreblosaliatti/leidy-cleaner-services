package br.com.leidycleaner.pagamentos.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.atendimentos.repository.AtendimentoFaxinaRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.pagamentos.entity.Pagamento;
import br.com.leidycleaner.pagamentos.entity.StatusPagamento;
import br.com.leidycleaner.pagamentos.gateway.AsaasProperties;
import br.com.leidycleaner.pagamentos.repository.PagamentoRepository;

@Service
public class WebhookService {

    private static final Logger LOGGER = LoggerFactory.getLogger(WebhookService.class);
    private static final Set<String> EVENTOS_SUPORTADOS = Set.of(
            "PAYMENT_RECEIVED",
            "PAYMENT_CONFIRMED",
            "PAYMENT_RECEIVED_IN_CASH",
            "CHECKOUT_PAID",
            "PAYMENT_OVERDUE",
            "PAYMENT_DELETED",
            "PAYMENT_REFUNDED",
            "PAYMENT_PARTIALLY_REFUNDED",
            "PAYMENT_CHARGEBACK_REQUESTED",
            "PAYMENT_CHARGEBACK_DISPUTE",
            "PAYMENT_AWAITING_CHARGEBACK_REVERSAL"
    );

    private final PagamentoRepository pagamentoRepository;
    private final AtendimentoFaxinaRepository atendimentoFaxinaRepository;
    private final ObjectMapper objectMapper;
    private final AsaasProperties asaasProperties;

    public WebhookService(
            PagamentoRepository pagamentoRepository,
            AtendimentoFaxinaRepository atendimentoFaxinaRepository,
            ObjectMapper objectMapper,
            AsaasProperties asaasProperties
    ) {
        this.pagamentoRepository = pagamentoRepository;
        this.atendimentoFaxinaRepository = atendimentoFaxinaRepository;
        this.objectMapper = objectMapper;
        this.asaasProperties = asaasProperties;
    }

    @Transactional
    public void processarWebhookAsaas(String accessToken, String payload) {
        validarAccessTokenAsaas(accessToken);
        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            String event = texto(jsonNode.path("event"));
            if (event == null) {
                LOGGER.warn("asaas_webhook_payload_invalid reason=missing_event");
                throw new BusinessException(
                        "WEBHOOK_PAYLOAD_INVALIDO",
                        "Payload de webhook invalido: campo event ausente",
                        HttpStatus.BAD_REQUEST
                );
            }
            if (!EVENTOS_SUPORTADOS.contains(event)) {
                LOGGER.info("asaas_webhook_event_ignored reason=unsupported_event event={}", event);
                return;
            }

            String gatewayPaymentId = extrairGatewayPaymentId(jsonNode, event);
            if (gatewayPaymentId == null) {
                LOGGER.warn("asaas_webhook_payload_ignored reason=missing_gateway_payment_id event={}", event);
                return;
            }

            StatusPagamento statusDestino = mapearStatusPagamento(jsonNode, event);

            Optional<Pagamento> pagamentoOptional = pagamentoRepository.findByGatewayPaymentId(gatewayPaymentId);
            if (pagamentoOptional.isEmpty()) {
                LOGGER.warn(
                        "asaas_webhook_pagamento_not_found event={} gatewayPaymentId={}",
                        event,
                        gatewayPaymentId
                );
                return;
            }

            Pagamento pagamento = pagamentoOptional.get();
            StatusPagamento statusAnterior = pagamento.getStatus();
            boolean mudou = pagamento.aplicarStatusWebhook(statusDestino, payload);
            if (!mudou) {
                LOGGER.info(
                        "asaas_webhook_idempotent event={} gatewayPaymentId={} pagamentoId={} statusAtual={} webhookProcessado={}",
                        event,
                        gatewayPaymentId,
                        pagamento.getId(),
                        pagamento.getStatus(),
                        pagamento.isWebhookProcessado()
                );
                return;
            }

            LOGGER.info(
                    "asaas_webhook_pagamento_updated event={} gatewayPaymentId={} pagamentoId={} statusAnterior={} statusAtual={} webhookProcessado={}",
                    event,
                    gatewayPaymentId,
                    pagamento.getId(),
                    statusAnterior,
                    pagamento.getStatus(),
                    pagamento.isWebhookProcessado()
            );
            if (mudou && statusDestino == StatusPagamento.PAGO) {
                LOGGER.info(
                        "asaas_webhook_pagamento_confirmed event={} gatewayPaymentId={} pagamentoId={}",
                        event,
                        gatewayPaymentId,
                        pagamento.getId()
                );
                atualizarStatusAtendimento(pagamento.getAtendimento(), pagamento.getId(), gatewayPaymentId, event);
            }
        } catch (BusinessException exception) {
            throw exception;
        } catch (JsonProcessingException exception) {
            LOGGER.warn("asaas_webhook_payload_invalid reason=malformed_json");
            throw new BusinessException(
                    "WEBHOOK_PAYLOAD_INVALIDO",
                    "Payload de webhook invalido",
                    HttpStatus.BAD_REQUEST
            );
        } catch (Exception e) {
            LOGGER.error("asaas_webhook_processing_error errorType={}", e.getClass().getSimpleName());
            throw new BusinessException(
                    "WEBHOOK_PROCESSAMENTO_ERRO",
                    "Erro ao processar webhook: " + e.getMessage(),
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private void validarAccessTokenAsaas(String accessToken) {
        String webhookToken = asaasProperties.getWebhookToken();
        if (webhookToken == null || webhookToken.isBlank()) {
            LOGGER.error("asaas_webhook_auth_failed reason=missing_config");
            throw new BusinessException(
                    "ASAAS_WEBHOOK_TOKEN_NAO_CONFIGURADO",
                    "Token do webhook Asaas nao configurado",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        if (accessToken == null || accessToken.isBlank()) {
            LOGGER.warn("asaas_webhook_auth_failed reason=missing_token");
            throw new BusinessException(
                    "ASAAS_WEBHOOK_TOKEN_INVALIDO",
                    "Token do webhook Asaas ausente ou invalido",
                    HttpStatus.UNAUTHORIZED
            );
        }
        if (!tokensIguais(accessToken, webhookToken)) {
            LOGGER.warn("asaas_webhook_auth_failed reason=invalid_token");
            throw new BusinessException(
                    "ASAAS_WEBHOOK_TOKEN_INVALIDO",
                    "Token do webhook Asaas ausente ou invalido",
                    HttpStatus.UNAUTHORIZED
            );
        }
    }

    private boolean tokensIguais(String accessToken, String webhookToken) {
        return MessageDigest.isEqual(
                accessToken.getBytes(StandardCharsets.UTF_8),
                webhookToken.getBytes(StandardCharsets.UTF_8)
        );
    }

    private void atualizarStatusAtendimento(
            AtendimentoFaxina atendimento,
            Long pagamentoId,
            String gatewayPaymentId,
            String event
    ) {
        atendimento.confirmarPagamento();
        atendimentoFaxinaRepository.save(atendimento);
        LOGGER.info(
                "asaas_webhook_atendimento_confirmed event={} gatewayPaymentId={} pagamentoId={} atendimentoId={} status={}",
                event,
                gatewayPaymentId,
                pagamentoId,
                atendimento.getId(),
                atendimento.getStatus()
        );
    }

    private String extrairGatewayPaymentId(JsonNode jsonNode, String event) {
        if ("CHECKOUT_PAID".equals(event)) {
            String checkoutId = texto(jsonNode.path("checkout").path("id"));
            if (checkoutId != null) {
                return checkoutId;
            }
        }
        return texto(jsonNode.path("payment").path("id"));
    }

    private StatusPagamento mapearStatusPagamento(JsonNode jsonNode, String event) {
        String statusGateway = texto(jsonNode.path("payment").path("status"));
        return switch (event) {
            case "PAYMENT_RECEIVED", "PAYMENT_CONFIRMED", "PAYMENT_RECEIVED_IN_CASH", "CHECKOUT_PAID" ->
                    statusComFallback(statusGateway, StatusPagamento.PAGO);
            case "PAYMENT_OVERDUE" -> statusComFallback(statusGateway, StatusPagamento.FALHOU);
            case "PAYMENT_DELETED" -> statusComFallback(statusGateway, StatusPagamento.CANCELADO);
            case "PAYMENT_REFUNDED", "PAYMENT_PARTIALLY_REFUNDED", "PAYMENT_CHARGEBACK_REQUESTED",
                    "PAYMENT_CHARGEBACK_DISPUTE", "PAYMENT_AWAITING_CHARGEBACK_REVERSAL" ->
                    statusComFallback(statusGateway, StatusPagamento.ESTORNADO);
            default -> throw new IllegalStateException("Evento suportado sem mapeamento de status");
        };
    }

    private StatusPagamento mapearStatusGateway(String statusGateway) {
        return switch (statusGateway) {
            case "RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH" -> StatusPagamento.PAGO;
            case "OVERDUE" -> StatusPagamento.FALHOU;
            case "DELETED" -> StatusPagamento.CANCELADO;
            case "REFUNDED", "REFUND_REQUESTED", "CHARGEBACK_REQUESTED", "CHARGEBACK_DISPUTE",
                    "AWAITING_CHARGEBACK_REVERSAL" -> StatusPagamento.ESTORNADO;
            case "PENDING", "AWAITING_RISK_ANALYSIS" -> StatusPagamento.PENDENTE;
            default -> null;
        };
    }

    private StatusPagamento statusComFallback(String statusGateway, StatusPagamento padrao) {
        StatusPagamento statusMapeado = statusGateway == null ? null : mapearStatusGateway(statusGateway);
        return statusMapeado == null ? padrao : statusMapeado;
    }

    private String texto(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        String valor = node.asText();
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor;
    }
}
