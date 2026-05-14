package br.com.leidycleaner.convites.service;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import br.com.leidycleaner.convites.entity.StatusConvite;
import br.com.leidycleaner.convites.repository.ConviteProfissionalRepository;

@Service
public class ConviteExpiracaoService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ConviteExpiracaoService.class);
    private static final List<StatusConvite> STATUS_RESPONDIVEIS = List.of(StatusConvite.ENVIADO, StatusConvite.VISUALIZADO);

    private final ConviteProfissionalRepository conviteProfissionalRepository;
    private final ConviteProfissionalService conviteProfissionalService;
    private final TransactionTemplate transactionTemplate;
    private final Clock clock;
    private final boolean schedulerEnabled;
    private final int batchSize;

    public ConviteExpiracaoService(
            ConviteProfissionalRepository conviteProfissionalRepository,
            ConviteProfissionalService conviteProfissionalService,
            PlatformTransactionManager transactionManager,
            @Value("${app.convites.expiracao.scheduler-enabled:true}") boolean schedulerEnabled,
            @Value("${app.convites.expiracao.batch-size:50}") int batchSize
    ) {
        this.conviteProfissionalRepository = conviteProfissionalRepository;
        this.conviteProfissionalService = conviteProfissionalService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        this.clock = Clock.systemDefaultZone();
        this.schedulerEnabled = schedulerEnabled;
        this.batchSize = batchSize;
    }

    @Scheduled(
            fixedDelayString = "${app.convites.expiracao.fixed-delay-ms:300000}",
            initialDelayString = "${app.convites.expiracao.initial-delay-ms:60000}"
    )
    public void processarConvitesExpiradosAgendado() {
        if (!schedulerEnabled) {
            return;
        }
        processarConvitesExpirados();
    }

    public int processarConvitesExpirados() {
        OffsetDateTime agora = OffsetDateTime.now(clock);
        LOGGER.info("convite_expiracao_batch_iniciado agora={} batchSize={}", agora, batchSize);

        List<Long> conviteIds = conviteProfissionalRepository.findExpiredRespondableIds(
                STATUS_RESPONDIVEIS,
                agora,
                PageRequest.of(0, batchSize)
        );

        LOGGER.info("convite_expiracao_batch_encontrados quantidade={} agora={}", conviteIds.size(), agora);

        int processados = 0;
        for (Long conviteId : conviteIds) {
            try {
                ConviteExpiracaoResultado resultado = transactionTemplate.execute(
                        status -> conviteProfissionalService.processarExpiracaoAutomatica(conviteId)
                );

                if (resultado == null) {
                    LOGGER.warn("convite_expiracao_resultado_nulo conviteId={}", conviteId);
                    continue;
                }

                if (resultado.processado()) {
                    processados++;
                    LOGGER.info(
                            "convite_expiracao_processado conviteId={} solicitacaoId={} profissionalId={} pagamentoId={} creditoGerado={} statusConviteFinal={} statusSolicitacaoFinal={} motivo={}",
                            resultado.conviteId(),
                            resultado.solicitacaoId(),
                            resultado.profissionalId(),
                            resultado.pagamentoId(),
                            resultado.creditoGerado(),
                            resultado.statusConviteFinal(),
                            resultado.statusSolicitacaoFinal(),
                            resultado.motivo()
                    );
                } else {
                    LOGGER.info(
                            "convite_expiracao_ignorado conviteId={} solicitacaoId={} profissionalId={} pagamentoId={} statusConviteFinal={} statusSolicitacaoFinal={} motivo={}",
                            resultado.conviteId(),
                            resultado.solicitacaoId(),
                            resultado.profissionalId(),
                            resultado.pagamentoId(),
                            resultado.statusConviteFinal(),
                            resultado.statusSolicitacaoFinal(),
                            resultado.motivo()
                    );
                }
            } catch (RuntimeException exception) {
                LOGGER.error(
                        "convite_expiracao_falhou conviteId={} mensagem={}",
                        conviteId,
                        exception.getMessage(),
                        exception
                );
            }
        }

        LOGGER.info(
                "convite_expiracao_batch_finalizado quantidadeEncontrada={} quantidadeProcessada={}",
                conviteIds.size(),
                processados
        );
        return processados;
    }
}
