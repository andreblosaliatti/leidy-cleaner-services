package br.com.leidycleaner.convites;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

import br.com.leidycleaner.convites.entity.StatusConvite;
import br.com.leidycleaner.convites.repository.ConviteProfissionalRepository;
import br.com.leidycleaner.convites.service.ConviteExpiracaoResultado;
import br.com.leidycleaner.convites.service.ConviteExpiracaoService;
import br.com.leidycleaner.convites.service.ConviteProfissionalService;
import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;

@ExtendWith(MockitoExtension.class)
class ConviteExpiracaoServiceTest {

    @Mock
    private ConviteProfissionalRepository conviteProfissionalRepository;

    @Mock
    private ConviteProfissionalService conviteProfissionalService;

    @Test
    void processarConvitesExpiradosContaSomenteOsConvitesProcessados() {
        ConviteExpiracaoService service = new ConviteExpiracaoService(
                conviteProfissionalRepository,
                conviteProfissionalService,
                new NoOpTransactionManager(),
                true,
                25
        );
        given(conviteProfissionalRepository.findExpiredRespondableIds(any(), any(), any(Pageable.class)))
                .willReturn(List.of(10L, 11L));
        given(conviteProfissionalService.processarExpiracaoAutomatica(10L))
                .willReturn(ConviteExpiracaoResultado.processado(
                        10L,
                        100L,
                        1000L,
                        10000L,
                        true,
                        StatusConvite.EXPIRADO,
                        StatusSolicitacao.NAO_ACEITA_CREDITO_GERADO,
                        "CONVITE_PAGO_EXPIRADO_COM_CREDITO"
                ));
        given(conviteProfissionalService.processarExpiracaoAutomatica(11L))
                .willReturn(ConviteExpiracaoResultado.ignorado(
                        11L,
                        101L,
                        1001L,
                        10001L,
                        StatusConvite.ACEITO,
                        StatusSolicitacao.ACEITA,
                        "CONVITE_STATUS_ACEITO"
                ));

        assertThat(service.processarConvitesExpirados()).isEqualTo(1);

        then(conviteProfissionalRepository).should()
                .findExpiredRespondableIds(eq(List.of(StatusConvite.ENVIADO, StatusConvite.VISUALIZADO)), any(), any(Pageable.class));
        then(conviteProfissionalService).should().processarExpiracaoAutomatica(10L);
        then(conviteProfissionalService).should().processarExpiracaoAutomatica(11L);
    }

    @Test
    void processarConvitesExpiradosContinuaQuandoUmConviteFalha() {
        ConviteExpiracaoService service = new ConviteExpiracaoService(
                conviteProfissionalRepository,
                conviteProfissionalService,
                new NoOpTransactionManager(),
                true,
                25
        );
        given(conviteProfissionalRepository.findExpiredRespondableIds(any(), any(), any(Pageable.class)))
                .willReturn(List.of(20L, 21L));
        given(conviteProfissionalService.processarExpiracaoAutomatica(20L))
                .willThrow(new IllegalStateException("falha simulada"));
        given(conviteProfissionalService.processarExpiracaoAutomatica(21L))
                .willReturn(ConviteExpiracaoResultado.processado(
                        21L,
                        201L,
                        2001L,
                        20001L,
                        false,
                        StatusConvite.EXPIRADO,
                        StatusSolicitacao.CONVITES_ENVIADOS,
                        "CONVITE_LEGADO_EXPIRADO"
                ));

        assertThat(service.processarConvitesExpirados()).isEqualTo(1);

        then(conviteProfissionalService).should().processarExpiracaoAutomatica(20L);
        then(conviteProfissionalService).should().processarExpiracaoAutomatica(21L);
    }

    private static class NoOpTransactionManager implements PlatformTransactionManager {

        @Override
        public TransactionStatus getTransaction(TransactionDefinition definition) {
            return new SimpleTransactionStatus();
        }

        @Override
        public void commit(TransactionStatus status) {
        }

        @Override
        public void rollback(TransactionStatus status) {
        }
    }
}
