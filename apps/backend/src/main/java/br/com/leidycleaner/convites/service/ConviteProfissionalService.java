package br.com.leidycleaner.convites.service;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.convites.dto.ConviteProfissionalDto;
import br.com.leidycleaner.convites.entity.ConviteProfissional;
import br.com.leidycleaner.convites.mapper.ConviteProfissionalMapper;
import br.com.leidycleaner.convites.repository.ConviteProfissionalRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.profissionais.repository.PerfilProfissionalRepository;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoProfissionalSelecionado;

@Service
public class ConviteProfissionalService {

    private static final int HORAS_PARA_EXPIRAR = 24;

    private final ConviteProfissionalRepository conviteProfissionalRepository;
    private final PerfilProfissionalRepository perfilProfissionalRepository;
    private final Clock clock;

    public ConviteProfissionalService(
            ConviteProfissionalRepository conviteProfissionalRepository,
            PerfilProfissionalRepository perfilProfissionalRepository
    ) {
        this.conviteProfissionalRepository = conviteProfissionalRepository;
        this.perfilProfissionalRepository = perfilProfissionalRepository;
        this.clock = Clock.systemDefaultZone();
    }

    public List<ConviteProfissional> substituirConvitesDaSolicitacao(
            SolicitacaoFaxina solicitacao,
            List<SolicitacaoProfissionalSelecionado> selecionados
    ) {
        conviteProfissionalRepository.deleteBySolicitacaoId(solicitacao.getId());
        conviteProfissionalRepository.flush();

        OffsetDateTime enviadoEm = OffsetDateTime.now(clock);
        OffsetDateTime expiraEm = enviadoEm.plusHours(HORAS_PARA_EXPIRAR);
        List<ConviteProfissional> convites = selecionados.stream()
                .map(selecionado -> new ConviteProfissional(
                        solicitacao,
                        selecionado.getProfissional(),
                        enviadoEm,
                        expiraEm
                ))
                .toList();
        return conviteProfissionalRepository.saveAll(convites);
    }

    @Transactional(readOnly = true)
    public List<ConviteProfissionalDto> listarMeus(Long usuarioId) {
        validarPerfilProfissional(usuarioId);
        return conviteProfissionalRepository.findByProfissionalUsuarioIdOrderByEnviadoEmDescIdDesc(usuarioId)
                .stream()
                .map(ConviteProfissionalMapper::paraDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConviteProfissionalDto buscarMeu(Long usuarioId, Long conviteId) {
        validarPerfilProfissional(usuarioId);
        return conviteProfissionalRepository.findByIdAndProfissionalUsuarioId(conviteId, usuarioId)
                .map(ConviteProfissionalMapper::paraDto)
                .orElseThrow(() -> new BusinessException("CONVITE_NOT_FOUND", "Convite nao encontrado", HttpStatus.NOT_FOUND));
    }

    private void validarPerfilProfissional(Long usuarioId) {
        if (perfilProfissionalRepository.findByUsuarioId(usuarioId).isEmpty()) {
            throw new AccessDeniedException("Usuario autenticado nao possui perfil profissional");
        }
    }
}
