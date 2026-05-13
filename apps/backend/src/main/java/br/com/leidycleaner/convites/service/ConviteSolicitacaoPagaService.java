package br.com.leidycleaner.convites.service;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.convites.entity.ConviteProfissional;
import br.com.leidycleaner.convites.repository.ConviteProfissionalRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoProfissionalSelecionado;
import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;
import br.com.leidycleaner.solicitacoes.repository.SolicitacaoProfissionalSelecionadoRepository;

@Service
public class ConviteSolicitacaoPagaService {

    private static final int HORAS_PARA_EXPIRAR = 24;

    private final ConviteProfissionalRepository conviteProfissionalRepository;
    private final SolicitacaoProfissionalSelecionadoRepository solicitacaoProfissionalSelecionadoRepository;
    private final Clock clock;

    public ConviteSolicitacaoPagaService(
            ConviteProfissionalRepository conviteProfissionalRepository,
            SolicitacaoProfissionalSelecionadoRepository solicitacaoProfissionalSelecionadoRepository
    ) {
        this.conviteProfissionalRepository = conviteProfissionalRepository;
        this.solicitacaoProfissionalSelecionadoRepository = solicitacaoProfissionalSelecionadoRepository;
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
        return conviteProfissionalRepository.save(convite);
    }
}
