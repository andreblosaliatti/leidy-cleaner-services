package br.com.leidycleaner.pagamentos.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.atendimentos.entity.StatusAtendimento;
import br.com.leidycleaner.atendimentos.repository.AtendimentoFaxinaRepository;
import br.com.leidycleaner.convites.entity.ConviteProfissional;
import br.com.leidycleaner.convites.service.ConviteProfissionalService;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.pagamentos.entity.Pagamento;
import br.com.leidycleaner.pagamentos.entity.StatusPagamento;

@Service
public class PagamentoConfirmacaoService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PagamentoConfirmacaoService.class);

    private final AtendimentoFaxinaRepository atendimentoFaxinaRepository;
    private final ConviteProfissionalService conviteProfissionalService;

    public PagamentoConfirmacaoService(
            AtendimentoFaxinaRepository atendimentoFaxinaRepository,
            ConviteProfissionalService conviteProfissionalService
    ) {
        this.atendimentoFaxinaRepository = atendimentoFaxinaRepository;
        this.conviteProfissionalService = conviteProfissionalService;
    }

    public void processarPagamentoConfirmado(Pagamento pagamento, ConfirmacaoPagamentoContext contexto) {
        if (pagamento.getStatus() != StatusPagamento.PAGO) {
            throw new BusinessException(
                    "PAGAMENTO_NAO_CONFIRMADO",
                    "Fluxo operacional so pode continuar quando o pagamento estiver pago",
                    HttpStatus.CONFLICT
            );
        }

        AtendimentoFaxina atendimento = pagamento.getAtendimento();
        if (atendimento != null) {
            confirmarPagamentoDeAtendimento(pagamento, atendimento, contexto);
            return;
        }

        if (pagamento.getSolicitacao() == null) {
            throw new BusinessException(
                    "PAGAMENTO_SEM_REFERENCIA_OPERACIONAL",
                    "Pagamento confirmado nao esta vinculado a atendimento nem a solicitacao",
                    HttpStatus.CONFLICT
            );
        }

        ConviteProfissional convite = conviteProfissionalService.criarConviteParaSolicitacaoPaga(pagamento.getSolicitacao());
        LOGGER.info(
                "pagamento_confirmado_solicitacao origem={} event={} paymentId={} paymentStatus={} paymentExternalReference={} gatewayPaymentId={} solicitacaoId={} pagamentoId={} conviteId={} profissionalId={} solicitacaoStatus={}",
                contexto.origem(),
                contexto.event(),
                contexto.paymentId(),
                contexto.paymentStatus(),
                contexto.paymentExternalReference(),
                pagamento.getGatewayPaymentId(),
                pagamento.getSolicitacao().getId(),
                pagamento.getId(),
                convite.getId(),
                convite.getProfissional().getId(),
                pagamento.getSolicitacao().getStatus()
        );
    }

    private void confirmarPagamentoDeAtendimento(
            Pagamento pagamento,
            AtendimentoFaxina atendimento,
            ConfirmacaoPagamentoContext contexto
    ) {
        if (atendimento.getStatus() == StatusAtendimento.CANCELADO) {
            atendimento.enviarParaAnalise();
            atendimentoFaxinaRepository.save(atendimento);
            LOGGER.warn(
                    "pagamento_confirmado_atendimento_cancelado origem={} event={} paymentId={} paymentStatus={} paymentExternalReference={} gatewayPaymentId={} solicitacaoId={} pagamentoId={} atendimentoId={} atendimentoStatus={}",
                    contexto.origem(),
                    contexto.event(),
                    contexto.paymentId(),
                    contexto.paymentStatus(),
                    contexto.paymentExternalReference(),
                    pagamento.getGatewayPaymentId(),
                    pagamento.getSolicitacao() != null ? pagamento.getSolicitacao().getId() : null,
                    pagamento.getId(),
                    atendimento.getId(),
                    atendimento.getStatus()
            );
            return;
        }

        atendimento.confirmarPagamento();
        atendimentoFaxinaRepository.save(atendimento);
        LOGGER.info(
                "pagamento_confirmado_atendimento origem={} event={} paymentId={} paymentStatus={} paymentExternalReference={} gatewayPaymentId={} solicitacaoId={} pagamentoId={} atendimentoId={} atendimentoStatus={}",
                contexto.origem(),
                contexto.event(),
                contexto.paymentId(),
                contexto.paymentStatus(),
                contexto.paymentExternalReference(),
                pagamento.getGatewayPaymentId(),
                pagamento.getSolicitacao() != null ? pagamento.getSolicitacao().getId() : null,
                pagamento.getId(),
                atendimento.getId(),
                atendimento.getStatus()
        );
    }

    public record ConfirmacaoPagamentoContext(
            String origem,
            String event,
            String paymentId,
            String paymentStatus,
            String paymentExternalReference
    ) {
    }
}
