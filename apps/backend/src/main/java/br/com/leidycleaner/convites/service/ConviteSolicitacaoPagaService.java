package br.com.leidycleaner.convites.service;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.convites.entity.ConviteProfissional;
import br.com.leidycleaner.convites.repository.ConviteProfissionalRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.notificacoes.entity.DispositivoPush;
import br.com.leidycleaner.notificacoes.provider.EnviarPushCommand;
import br.com.leidycleaner.notificacoes.provider.PushNotificationPayload;
import br.com.leidycleaner.notificacoes.provider.PushNotificationProvider;
import br.com.leidycleaner.notificacoes.repository.DispositivoPushRepository;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoProfissionalSelecionado;
import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;
import br.com.leidycleaner.solicitacoes.repository.SolicitacaoProfissionalSelecionadoRepository;

@Service
public class ConviteSolicitacaoPagaService {

    private static final Logger log = LoggerFactory.getLogger(ConviteSolicitacaoPagaService.class);
    private static final int HORAS_PARA_EXPIRAR = 24;

    private final ConviteProfissionalRepository conviteProfissionalRepository;
    private final SolicitacaoProfissionalSelecionadoRepository solicitacaoProfissionalSelecionadoRepository;
    private final DispositivoPushRepository dispositivoPushRepository;
    private final PushNotificationProvider pushNotificationProvider;
    private final Clock clock;

    public ConviteSolicitacaoPagaService(
            ConviteProfissionalRepository conviteProfissionalRepository,
            SolicitacaoProfissionalSelecionadoRepository solicitacaoProfissionalSelecionadoRepository,
            DispositivoPushRepository dispositivoPushRepository,
            PushNotificationProvider pushNotificationProvider
    ) {
        this.conviteProfissionalRepository = conviteProfissionalRepository;
        this.solicitacaoProfissionalSelecionadoRepository = solicitacaoProfissionalSelecionadoRepository;
        this.dispositivoPushRepository = dispositivoPushRepository;
        this.pushNotificationProvider = pushNotificationProvider;
        this.clock = Clock.systemDefaultZone();
    }

    @Transactional
    public ConviteProfissional criarConviteParaSolicitacaoPaga(SolicitacaoFaxina solicitacao) {
        validarSolicitacaoElegivelParaConvitePago(solicitacao);

        List<SolicitacaoProfissionalSelecionado> selecionados = solicitacaoProfissionalSelecionadoRepository
                .findBySolicitacaoIdOrderByOrdemEscolhaAsc(solicitacao.getId());
        if (selecionados.size() != 1) {
            throw new BusinessException(
                    "SOLICITACAO_PROFISSIONAL_SELECIONADA_INVALIDA",
                    "Solicitacao paga deve ter exatamente uma profissional selecionada para envio de convite",
                    HttpStatus.CONFLICT
            );
        }

        SolicitacaoProfissionalSelecionado selecionado = selecionados.getFirst();
        Long profissionalId = selecionado.getProfissional().getId();
        return conviteProfissionalRepository
                .findBySolicitacaoIdAndProfissionalId(solicitacao.getId(), profissionalId)
                .map(conviteExistente -> {
                    solicitacao.marcarPagaAguardandoAceite();
                    return conviteExistente;
                })
                .orElseGet(() -> criarPrimeiroConviteParaSolicitacaoPaga(solicitacao, selecionado));
    }

    private void validarSolicitacaoElegivelParaConvitePago(SolicitacaoFaxina solicitacao) {
        if (solicitacao.getStatus() != StatusSolicitacao.AGUARDANDO_PAGAMENTO
                && solicitacao.getStatus() != StatusSolicitacao.PAGA_AGUARDANDO_ACEITE) {
            throw new BusinessException(
                    "SOLICITACAO_STATUS_INCOMPATIVEL",
                    "Solicitacao nao esta em status compativel com envio de convite apos pagamento",
                    HttpStatus.CONFLICT
            );
        }
    }

    private ConviteProfissional criarPrimeiroConviteParaSolicitacaoPaga(
            SolicitacaoFaxina solicitacao,
            SolicitacaoProfissionalSelecionado selecionado
    ) {
        if (conviteProfissionalRepository.existsBySolicitacaoId(solicitacao.getId())) {
            throw new BusinessException(
                    "CONVITE_SOLICITACAO_INCONSISTENTE",
                    "Solicitacao paga ja possui convite para profissional diferente da selecionada",
                    HttpStatus.CONFLICT
            );
        }

        OffsetDateTime enviadoEm = OffsetDateTime.now(clock);
        ConviteProfissional convite = new ConviteProfissional(
                solicitacao,
                selecionado.getProfissional(),
                enviadoEm,
                enviadoEm.plusHours(HORAS_PARA_EXPIRAR)
        );
        solicitacao.marcarPagaAguardandoAceite();
        ConviteProfissional conviteSalvo = conviteProfissionalRepository.save(convite);
        
        // Send push notification asynchronously without blocking convite creation
        enviarPushNotificacaoConvite(selecionado.getProfissional().getId(), conviteSalvo.getId());
        
        return conviteSalvo;
    }

    private void enviarPushNotificacaoConvite(Long profissionalId, Long conviteId) {
        try {
            List<DispositivoPush> dispositivos = dispositivoPushRepository.findByUsuario_IdAndAtivoTrue(profissionalId);
            
            if (dispositivos.isEmpty()) {
                log.debug("Nenhum dispositivo ativo encontrado para enviar push de convite ao profissional {}", profissionalId);
                return;
            }

            PushNotificationPayload payload = new PushNotificationPayload(
                    "Novo convite de faxina",
                    "Você recebeu um novo convite para responder.",
                    Map.of(
                            "tipo", "CONVITE_RECEBIDO",
                            "conviteId", conviteId.toString()
                    )
            );

            for (DispositivoPush dispositivo : dispositivos) {
                try {
                    var resultado = pushNotificationProvider.enviar(new EnviarPushCommand(
                            profissionalId,
                            dispositivo.getPlataforma(),
                            dispositivo.getToken(),
                            payload
                    ));
                    
                    if (resultado.enviado()) {
                        log.debug("Push de convite enviado para profissionalId={} dispositivoId={}", 
                                profissionalId, dispositivo.getId());
                    } else {
                        log.debug("Push de convite nao enviado para profissionalId={} dispositivoId={}: {}", 
                                profissionalId, dispositivo.getId(), resultado.codigo());
                    }
                } catch (Exception e) {
                    log.warn("Falha ao enviar push de convite para profissionalId={} dispositivoId={}: {}", 
                            profissionalId, dispositivo.getId(), e.getMessage());
                    // Continue to next device; do not throw
                }
            }
        } catch (Exception e) {
            // Log warning but do not throw; push is operational only, not critical
            log.warn("Falha geral ao enviar notificacoes push de convite para profissionalId={}: {}", 
                    profissionalId, e.getMessage());
        }
    }
}
