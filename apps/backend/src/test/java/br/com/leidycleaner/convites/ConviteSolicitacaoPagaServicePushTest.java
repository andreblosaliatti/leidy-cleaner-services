package br.com.leidycleaner.convites;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;

import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.leidycleaner.convites.entity.ConviteProfissional;
import br.com.leidycleaner.convites.repository.ConviteProfissionalRepository;
import br.com.leidycleaner.convites.service.ConviteSolicitacaoPagaService;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.notificacoes.entity.DispositivoPush;
import br.com.leidycleaner.notificacoes.entity.PlataformaPush;
import br.com.leidycleaner.notificacoes.provider.PushNotificationProvider;
import br.com.leidycleaner.notificacoes.provider.PushNotificationResult;
import br.com.leidycleaner.notificacoes.repository.DispositivoPushRepository;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoProfissionalSelecionado;
import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;
import br.com.leidycleaner.solicitacoes.repository.SolicitacaoProfissionalSelecionadoRepository;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;

@ExtendWith(MockitoExtension.class)
class ConviteSolicitacaoPagaServicePushTest {

    @Mock
    private ConviteProfissionalRepository conviteProfissionalRepository;

    @Mock
    private SolicitacaoProfissionalSelecionadoRepository solicitacaoProfissionalSelecionadoRepository;

    @Mock
    private DispositivoPushRepository dispositivoPushRepository;

    @Mock
    private PushNotificationProvider pushNotificationProvider;

    @Test
    void criarConviteParaSolicitacaoPagaEnviaPushParaDispositivosAtivos() {
        // Arrange
        ConviteSolicitacaoPagaService service = new ConviteSolicitacaoPagaService(
                conviteProfissionalRepository,
                solicitacaoProfissionalSelecionadoRepository,
                dispositivoPushRepository,
                pushNotificationProvider
        );

        Usuario profissional = createProfissionalUsuario(1L);
        PerfilProfissional perfilProfissional = mock(PerfilProfissional.class);
        SolicitacaoProfissionalSelecionado selecionado = mock(SolicitacaoProfissionalSelecionado.class);
        SolicitacaoFaxina solicitacao = mock(SolicitacaoFaxina.class);

        given(solicitacao.getId()).willReturn(100L);
        given(solicitacao.getStatus()).willReturn(StatusSolicitacao.AGUARDANDO_PAGAMENTO);
        given(selecionado.getProfissional()).willReturn(perfilProfissional);
        given(perfilProfissional.getId()).willReturn(1L);
        given(solicitacaoProfissionalSelecionadoRepository.findBySolicitacaoIdOrderByOrdemEscolhaAsc(100L))
                .willReturn(List.of(selecionado));
        given(conviteProfissionalRepository.existsBySolicitacaoId(100L)).willReturn(false);
        given(conviteProfissionalRepository.findBySolicitacaoIdAndProfissionalId(100L, 1L))
                .willReturn(java.util.Optional.empty());

        // Mock dispositivos ativos
        DispositivoPush dispositivo = createDispositivoPush(1L, profissional, "fcm-token-123");
        given(dispositivoPushRepository.findByUsuario_IdAndAtivoTrue(1L)).willReturn(List.of(dispositivo));
        given(pushNotificationProvider.enviar(any())).willReturn(
                new PushNotificationResult(true, "ENVIADO", "Push enviado com sucesso")
        );

        ConviteProfissional conviteCriado = mock(ConviteProfissional.class);
        given(conviteCriado.getId()).willReturn(10L);
        given(conviteProfissionalRepository.save(any(ConviteProfissional.class))).willReturn(conviteCriado);

        // Act
        ConviteProfissional resultado = service.criarConviteParaSolicitacaoPaga(solicitacao);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(10L);

        // Verifica que push foi tentado para o dispositivo ativo
        then(pushNotificationProvider).should(times(1)).enviar(any());
        then(solicitacao).should(times(1)).marcarPagaAguardandoAceite();
    }

    @Test
    void criarConviteParaSolicitacaoPagaContinuaEMesmoSeEnvioPushFalhar() {
        // Arrange
        ConviteSolicitacaoPagaService service = new ConviteSolicitacaoPagaService(
                conviteProfissionalRepository,
                solicitacaoProfissionalSelecionadoRepository,
                dispositivoPushRepository,
                pushNotificationProvider
        );

        Usuario profissional = createProfissionalUsuario(2L);
        PerfilProfissional perfilProfissional = mock(PerfilProfissional.class);
        SolicitacaoProfissionalSelecionado selecionado = mock(SolicitacaoProfissionalSelecionado.class);
        SolicitacaoFaxina solicitacao = mock(SolicitacaoFaxina.class);

        given(solicitacao.getId()).willReturn(101L);
        given(solicitacao.getStatus()).willReturn(StatusSolicitacao.AGUARDANDO_PAGAMENTO);
        given(selecionado.getProfissional()).willReturn(perfilProfissional);
        given(perfilProfissional.getId()).willReturn(2L);
        given(solicitacaoProfissionalSelecionadoRepository.findBySolicitacaoIdOrderByOrdemEscolhaAsc(101L))
                .willReturn(List.of(selecionado));
        given(conviteProfissionalRepository.existsBySolicitacaoId(101L)).willReturn(false);
        given(conviteProfissionalRepository.findBySolicitacaoIdAndProfissionalId(101L, 2L))
                .willReturn(java.util.Optional.empty());

        // Mock dispositivo ativo mas push falha
        DispositivoPush dispositivo = createDispositivoPush(2L, profissional, "fcm-token-falha");
        given(dispositivoPushRepository.findByUsuario_IdAndAtivoTrue(2L)).willReturn(List.of(dispositivo));
        given(pushNotificationProvider.enviar(any())).willReturn(
                new PushNotificationResult(false, "FIREBASE_ERROR", "Falha ao enviar push")
        );

        ConviteProfissional conviteCriado = mock(ConviteProfissional.class);
        given(conviteCriado.getId()).willReturn(11L);
        given(conviteProfissionalRepository.save(any(ConviteProfissional.class))).willReturn(conviteCriado);

        // Act - deve criar convite mesmo com push falhando
        ConviteProfissional resultado = service.criarConviteParaSolicitacaoPaga(solicitacao);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(11L);

        // Verifica que push foi tentado
        then(pushNotificationProvider).should(times(1)).enviar(any());
        // Mas solicitação foi marcada como paga mesmo assim
        then(solicitacao).should(times(1)).marcarPagaAguardandoAceite();
    }

    @Test
    void criarConviteParaSolicitacaoPagaNaoEnviaPushSeNaoHaDispositivosAtivos() {
        // Arrange
        ConviteSolicitacaoPagaService service = new ConviteSolicitacaoPagaService(
                conviteProfissionalRepository,
                solicitacaoProfissionalSelecionadoRepository,
                dispositivoPushRepository,
                pushNotificationProvider
        );

        Usuario profissional = createProfissionalUsuario(3L);
        PerfilProfissional perfilProfissional = mock(PerfilProfissional.class);
        SolicitacaoProfissionalSelecionado selecionado = mock(SolicitacaoProfissionalSelecionado.class);
        SolicitacaoFaxina solicitacao = mock(SolicitacaoFaxina.class);

        given(solicitacao.getId()).willReturn(102L);
        given(solicitacao.getStatus()).willReturn(StatusSolicitacao.AGUARDANDO_PAGAMENTO);
        given(selecionado.getProfissional()).willReturn(perfilProfissional);
        given(perfilProfissional.getId()).willReturn(3L);
        given(solicitacaoProfissionalSelecionadoRepository.findBySolicitacaoIdOrderByOrdemEscolhaAsc(102L))
                .willReturn(List.of(selecionado));
        given(conviteProfissionalRepository.existsBySolicitacaoId(102L)).willReturn(false);
        given(conviteProfissionalRepository.findBySolicitacaoIdAndProfissionalId(102L, 3L))
                .willReturn(java.util.Optional.empty());

        // Mock: nenhum dispositivo ativo
        given(dispositivoPushRepository.findByUsuario_IdAndAtivoTrue(3L)).willReturn(List.of());

        ConviteProfissional conviteCriado = mock(ConviteProfissional.class);
        given(conviteCriado.getId()).willReturn(12L);
        given(conviteProfissionalRepository.save(any(ConviteProfissional.class))).willReturn(conviteCriado);

        // Act
        ConviteProfissional resultado = service.criarConviteParaSolicitacaoPaga(solicitacao);

        // Assert
        assertThat(resultado).isNotNull();
        assertThat(resultado.getId()).isEqualTo(12L);

        // Verifica que push NÃO foi tentado pois não há dispositivos
        then(pushNotificationProvider).should(never()).enviar(any());
        // Mas solicitação foi marcada como paga
        then(solicitacao).should(times(1)).marcarPagaAguardandoAceite();
    }

    private Usuario createProfissionalUsuario(Long id) {
        return mock(Usuario.class);
    }

    private DispositivoPush createDispositivoPush(Long dispositivoId, Usuario usuario, String token) {
        DispositivoPush dispositivo = mock(DispositivoPush.class);
        given(dispositivo.getId()).willReturn(dispositivoId);
        given(dispositivo.getPlataforma()).willReturn(PlataformaPush.ANDROID);
        given(dispositivo.getToken()).willReturn(token);
        return dispositivo;
    }
}
