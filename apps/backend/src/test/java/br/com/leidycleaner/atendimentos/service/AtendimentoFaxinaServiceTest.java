package br.com.leidycleaner.atendimentos.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;

import br.com.leidycleaner.atendimentos.dto.CheckpointServicoRequest;
import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.atendimentos.entity.CheckpointServico;
import br.com.leidycleaner.atendimentos.entity.StatusAtendimento;
import br.com.leidycleaner.atendimentos.entity.TipoCheckpointServico;
import br.com.leidycleaner.atendimentos.repository.AtendimentoFaxinaRepository;
import br.com.leidycleaner.atendimentos.repository.CheckpointServicoRepository;
import br.com.leidycleaner.avaliacoes.repository.AvaliacaoProfissionalRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.solicitacoes.entity.TipoServico;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AtendimentoFaxinaServiceTest {

    private static final Long ATENDIMENTO_ID = 100L;
    private static final Long PROFISSIONAL_USUARIO_ID = 200L;
    private static final Long CLIENTE_USUARIO_ID = 300L;
    private static final Long OUTRA_PROFISSIONAL_USUARIO_ID = 400L;

    @Mock
    private AtendimentoFaxinaRepository atendimentoFaxinaRepository;

    @Mock
    private CheckpointServicoRepository checkpointServicoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AvaliacaoProfissionalRepository avaliacaoProfissionalRepository;

    @Mock
    private AtendimentoExpiracaoService atendimentoExpiracaoService;

    private Clock clock;
    private AtendimentoFaxinaService service;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2026-06-09T16:00:00Z"), ZoneOffset.UTC);
        service = new AtendimentoFaxinaService(
                atendimentoFaxinaRepository,
                checkpointServicoRepository,
                usuarioRepository,
                avaliacaoProfissionalRepository,
                atendimentoExpiracaoService,
                clock
        );
    }

    @Test
    void deveRejeitarInicioQuandoAgendadoParaMaisDeTrintaMinutosNoFuturo() {
        AtendimentoFaxina atendimento = mockAtendimento(StatusAtendimento.CONFIRMADO, agora().plusMinutes(31));
        prepararBuscaAtendimento(atendimento);
        when(checkpointServicoRepository.existsByAtendimentoIdAndTipo(ATENDIMENTO_ID, TipoCheckpointServico.INICIO))
                .thenReturn(false);

        assertThatThrownBy(() -> service.iniciar(PROFISSIONAL_USUARIO_ID, ATENDIMENTO_ID, requestPadrao()))
                .isInstanceOf(BusinessException.class)
                .satisfies(exception -> {
                    BusinessException businessException = (BusinessException) exception;
                    assertThat(businessException.getCode()).isEqualTo("ATENDIMENTO_INICIO_ANTECIPADO");
                    assertThat(businessException.getMessage()).isEqualTo(
                            "Este atendimento s\u00f3 pode ser iniciado a partir de 30 minutos antes do hor\u00e1rio marcado."
                    );
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(atendimento, never()).iniciarServico(any());
        verify(checkpointServicoRepository, never()).save(any());
    }

    @Test
    void devePermitirInicioExatamenteTrintaMinutosAntesDoHorarioMarcado() {
        AtendimentoFaxina atendimento = mockAtendimento(StatusAtendimento.CONFIRMADO, agora().plusMinutes(30));
        Usuario usuario = mock(Usuario.class);
        prepararBuscaAtendimento(atendimento);
        when(checkpointServicoRepository.existsByAtendimentoIdAndTipo(ATENDIMENTO_ID, TipoCheckpointServico.INICIO))
                .thenReturn(false);
        when(usuarioRepository.getReferenceById(PROFISSIONAL_USUARIO_ID)).thenReturn(usuario);

        Object resposta = service.iniciar(PROFISSIONAL_USUARIO_ID, ATENDIMENTO_ID, requestPadrao());

        assertThat(resposta).isNotNull();
        verify(atendimento).iniciarServico(agora());
        assertCheckpointSalvoComHorario(agora());
    }

    @Test
    void devePermitirInicioComMenosDeTrintaMinutosParaOHorarioMarcado() {
        AtendimentoFaxina atendimento = mockAtendimento(StatusAtendimento.CONFIRMADO, agora().plusMinutes(10));
        Usuario usuario = mock(Usuario.class);
        prepararBuscaAtendimento(atendimento);
        when(checkpointServicoRepository.existsByAtendimentoIdAndTipo(ATENDIMENTO_ID, TipoCheckpointServico.INICIO))
                .thenReturn(false);
        when(usuarioRepository.getReferenceById(PROFISSIONAL_USUARIO_ID)).thenReturn(usuario);

        service.iniciar(PROFISSIONAL_USUARIO_ID, ATENDIMENTO_ID, requestPadrao());

        verify(atendimento).iniciarServico(agora());
        assertCheckpointSalvoComHorario(agora());
    }

    @Test
    void devePermitirInicioDepoisDoHorarioMarcado() {
        AtendimentoFaxina atendimento = mockAtendimento(StatusAtendimento.CONFIRMADO, agora().minusMinutes(5));
        Usuario usuario = mock(Usuario.class);
        prepararBuscaAtendimento(atendimento);
        when(checkpointServicoRepository.existsByAtendimentoIdAndTipo(ATENDIMENTO_ID, TipoCheckpointServico.INICIO))
                .thenReturn(false);
        when(usuarioRepository.getReferenceById(PROFISSIONAL_USUARIO_ID)).thenReturn(usuario);

        service.iniciar(PROFISSIONAL_USUARIO_ID, ATENDIMENTO_ID, requestPadrao());

        verify(atendimento).iniciarServico(agora());
        assertCheckpointSalvoComHorario(agora());
    }

    @Test
    void devePreservarRestricaoDeProfissionalNaoDesignada() {
        AtendimentoFaxina atendimento = mockAtendimento(StatusAtendimento.CONFIRMADO, agora().plusMinutes(10));
        prepararBuscaAtendimento(atendimento);

        assertThatThrownBy(() -> service.iniciar(OUTRA_PROFISSIONAL_USUARIO_ID, ATENDIMENTO_ID, requestPadrao()))
                .isInstanceOf(BusinessException.class)
                .satisfies(exception -> {
                    BusinessException businessException = (BusinessException) exception;
                    assertThat(businessException.getCode()).isEqualTo("ATENDIMENTO_NOT_FOUND");
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                });

        verify(atendimento, never()).iniciarServico(any());
        verify(checkpointServicoRepository, never()).save(any());
    }

    @Test
    void devePreservarRestricaoDeAtendimentoJaIniciado() {
        AtendimentoFaxina atendimento = mockAtendimento(StatusAtendimento.CONFIRMADO, agora().plusMinutes(10));
        prepararBuscaAtendimento(atendimento);
        when(checkpointServicoRepository.existsByAtendimentoIdAndTipo(ATENDIMENTO_ID, TipoCheckpointServico.INICIO))
                .thenReturn(true);

        assertThatThrownBy(() -> service.iniciar(PROFISSIONAL_USUARIO_ID, ATENDIMENTO_ID, requestPadrao()))
                .isInstanceOf(BusinessException.class)
                .satisfies(exception -> {
                    BusinessException businessException = (BusinessException) exception;
                    assertThat(businessException.getCode()).isEqualTo("ATENDIMENTO_JA_INICIADO");
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(atendimento, never()).iniciarServico(any());
        verify(checkpointServicoRepository, never()).save(any());
    }

    @Test
    void devePreservarRestricaoDeStatusInvalido() {
        AtendimentoFaxina atendimento = mockAtendimento(StatusAtendimento.EM_ANALISE, agora().plusMinutes(10));
        prepararBuscaAtendimento(atendimento);
        when(checkpointServicoRepository.existsByAtendimentoIdAndTipo(ATENDIMENTO_ID, TipoCheckpointServico.INICIO))
                .thenReturn(false);

        assertThatThrownBy(() -> service.iniciar(PROFISSIONAL_USUARIO_ID, ATENDIMENTO_ID, requestPadrao()))
                .isInstanceOf(BusinessException.class)
                .satisfies(exception -> {
                    BusinessException businessException = (BusinessException) exception;
                    assertThat(businessException.getCode()).isEqualTo("ATENDIMENTO_STATUS_INCOMPATIVEL");
                    assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                });

        verify(atendimento, never()).iniciarServico(any());
        verify(checkpointServicoRepository, never()).save(any());
    }

    private void prepararBuscaAtendimento(AtendimentoFaxina atendimento) {
        when(atendimentoFaxinaRepository.findByIdWithResumo(ATENDIMENTO_ID)).thenReturn(Optional.of(atendimento));
    }

    private AtendimentoFaxina mockAtendimento(StatusAtendimento status, OffsetDateTime inicioPrevistoEm) {
        AtendimentoFaxina atendimento = mock(AtendimentoFaxina.class, RETURNS_DEEP_STUBS);
        when(atendimento.getId()).thenReturn(ATENDIMENTO_ID);
        when(atendimento.getStatus()).thenReturn(status);
        when(atendimento.getInicioPrevistoEm()).thenReturn(inicioPrevistoEm);
        when(atendimento.getInicioRealEm()).thenReturn(null);
        when(atendimento.getFimRealEm()).thenReturn(null);
        when(atendimento.getCriadoEm()).thenReturn(agora().minusDays(1));
        when(atendimento.getAtualizadoEm()).thenReturn(agora().minusHours(1));
        when(atendimento.getValorServico()).thenReturn(new BigDecimal("180.00"));
        when(atendimento.getPercentualComissaoAgencia()).thenReturn(new BigDecimal("20.00"));
        when(atendimento.getValorEstimadoProfissional()).thenReturn(new BigDecimal("144.00"));

        when(atendimento.getSolicitacao().getId()).thenReturn(500L);
        when(atendimento.getSolicitacao().getTipoServico()).thenReturn(TipoServico.FAXINA_RESIDENCIAL);
        when(atendimento.getSolicitacao().getEndereco().getLogradouro()).thenReturn("Rua da Solicitacao");
        when(atendimento.getSolicitacao().getEndereco().getNumero()).thenReturn("123");
        when(atendimento.getSolicitacao().getEndereco().getComplemento()).thenReturn(null);
        when(atendimento.getSolicitacao().getEndereco().getBairro()).thenReturn("Centro");
        when(atendimento.getSolicitacao().getEndereco().getCidade()).thenReturn("Porto Alegre");
        when(atendimento.getSolicitacao().getEndereco().getEstado()).thenReturn("RS");
        when(atendimento.getSolicitacao().getRegiao().getNome()).thenReturn("Centro");

        when(atendimento.getCliente().getId()).thenReturn(600L);
        when(atendimento.getCliente().getUsuario().getId()).thenReturn(CLIENTE_USUARIO_ID);
        when(atendimento.getCliente().getUsuario().getNomeCompleto()).thenReturn("Cliente Solicitacao");

        when(atendimento.getProfissional().getId()).thenReturn(700L);
        when(atendimento.getProfissional().getUsuario().getId()).thenReturn(PROFISSIONAL_USUARIO_ID);
        when(atendimento.getProfissional().getNomeExibicao()).thenReturn("Profissional Solicitacao");
        when(atendimento.getProfissional().getNotaMedia()).thenReturn(new BigDecimal("4.50"));
        when(atendimento.getProfissional().getTotalAvaliacoes()).thenReturn(12);

        return atendimento;
    }

    private void assertCheckpointSalvoComHorario(OffsetDateTime esperado) {
        ArgumentCaptor<CheckpointServico> checkpointCaptor = ArgumentCaptor.forClass(CheckpointServico.class);
        verify(checkpointServicoRepository).save(checkpointCaptor.capture());
        CheckpointServico checkpoint = checkpointCaptor.getValue();
        assertThat(checkpoint.getTipo()).isEqualTo(TipoCheckpointServico.INICIO);
        assertThat(checkpoint.getRegistradoEm()).isEqualTo(esperado);
        assertThat(checkpoint.getFotoComprovacaoUrl()).isEqualTo("local/checkpoints/inicio.png");
        assertThat(checkpoint.getObservacao()).isEqualTo("Inicio do atendimento");
    }

    private CheckpointServicoRequest requestPadrao() {
        return new CheckpointServicoRequest(
                new BigDecimal("-30.0346000"),
                new BigDecimal("-51.2177000"),
                "local/checkpoints/inicio.png",
                "Inicio do atendimento"
        );
    }

    private OffsetDateTime agora() {
        return OffsetDateTime.now(clock);
    }
}
