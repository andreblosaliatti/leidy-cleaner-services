package br.com.leidycleaner.atendimentos.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.atendimentos.dto.AtendimentoFaxinaDto;
import br.com.leidycleaner.atendimentos.dto.CheckpointServicoDto;
import br.com.leidycleaner.atendimentos.dto.CheckpointServicoRequest;
import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.atendimentos.entity.CheckpointServico;
import br.com.leidycleaner.atendimentos.entity.StatusAtendimento;
import br.com.leidycleaner.atendimentos.entity.TipoCheckpointServico;
import br.com.leidycleaner.atendimentos.mapper.AtendimentoFaxinaMapper;
import br.com.leidycleaner.atendimentos.repository.AtendimentoFaxinaRepository;
import br.com.leidycleaner.atendimentos.repository.CheckpointServicoRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;

@Service
public class AtendimentoFaxinaService {

    private final AtendimentoFaxinaRepository atendimentoFaxinaRepository;
    private final CheckpointServicoRepository checkpointServicoRepository;
    private final UsuarioRepository usuarioRepository;

    public AtendimentoFaxinaService(
            AtendimentoFaxinaRepository atendimentoFaxinaRepository,
            CheckpointServicoRepository checkpointServicoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.atendimentoFaxinaRepository = atendimentoFaxinaRepository;
        this.checkpointServicoRepository = checkpointServicoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<AtendimentoFaxinaDto> listarMeus(Long usuarioId) {
        return atendimentoFaxinaRepository.findRelacionadosByUsuarioId(usuarioId)
                .stream()
                .map(AtendimentoFaxinaMapper::paraDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AtendimentoFaxinaDto buscarRelacionado(Long usuarioId, Long atendimentoId) {
        return AtendimentoFaxinaMapper.paraDto(buscarAtendimentoRelacionado(usuarioId, atendimentoId));
    }

    @Transactional(readOnly = true)
    public List<CheckpointServicoDto> listarCheckpoints(Long usuarioId, Long atendimentoId) {
        AtendimentoFaxina atendimento = buscarAtendimentoRelacionado(usuarioId, atendimentoId);
        return checkpointServicoRepository.findByAtendimentoIdOrderByRegistradoEmAscIdAsc(atendimento.getId())
                .stream()
                .map(AtendimentoFaxinaMapper::paraDto)
                .toList();
    }

    @Transactional
    public AtendimentoFaxinaDto iniciar(Long usuarioId, Long atendimentoId, CheckpointServicoRequest request) {
        AtendimentoFaxina atendimento = buscarAtendimentoParaExecucao(usuarioId, atendimentoId);
        validarPodeIniciar(atendimento);

        OffsetDateTime agora = OffsetDateTime.now();
        atendimento.iniciarServico(agora);
        registrarCheckpoint(atendimento, usuarioId, TipoCheckpointServico.INICIO, request, agora);

        return AtendimentoFaxinaMapper.paraDto(atendimento);
    }

    @Transactional
    public AtendimentoFaxinaDto finalizar(Long usuarioId, Long atendimentoId, CheckpointServicoRequest request) {
        AtendimentoFaxina atendimento = buscarAtendimentoParaExecucao(usuarioId, atendimentoId);
        validarPodeFinalizar(atendimento);

        OffsetDateTime agora = OffsetDateTime.now();
        atendimento.finalizarServico(agora);
        registrarCheckpoint(atendimento, usuarioId, TipoCheckpointServico.FIM, request, agora);

        return AtendimentoFaxinaMapper.paraDto(atendimento);
    }

    private AtendimentoFaxina buscarAtendimentoRelacionado(Long usuarioId, Long atendimentoId) {
        return atendimentoFaxinaRepository.findRelacionadoByIdAndUsuarioId(atendimentoId, usuarioId)
                .orElseThrow(() -> new BusinessException(
                        "ATENDIMENTO_NOT_FOUND",
                        "Atendimento nao encontrado",
                        HttpStatus.NOT_FOUND
                ));
    }

    private AtendimentoFaxina buscarAtendimentoParaExecucao(Long usuarioId, Long atendimentoId) {
        AtendimentoFaxina atendimento = atendimentoFaxinaRepository.findById(atendimentoId)
                .orElseThrow(() -> new BusinessException(
                        "ATENDIMENTO_NOT_FOUND",
                        "Atendimento nao encontrado",
                        HttpStatus.NOT_FOUND
                ));
        if (atendimento.getProfissional().getUsuario().getId().equals(usuarioId)) {
            return atendimento;
        }
        if (atendimento.getCliente().getUsuario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Somente a profissional designada pode executar o atendimento");
        }
        throw new BusinessException("ATENDIMENTO_NOT_FOUND", "Atendimento nao encontrado", HttpStatus.NOT_FOUND);
    }

    private void validarPodeIniciar(AtendimentoFaxina atendimento) {
        if (checkpointServicoRepository.existsByAtendimentoIdAndTipo(atendimento.getId(), TipoCheckpointServico.INICIO)
                || atendimento.getStatus() == StatusAtendimento.EM_EXECUCAO) {
            throw new BusinessException("ATENDIMENTO_JA_INICIADO", "Atendimento ja foi iniciado", HttpStatus.CONFLICT);
        }
        if (atendimento.getStatus() != StatusAtendimento.CONFIRMADO) {
            throw new BusinessException(
                    "ATENDIMENTO_STATUS_INCOMPATIVEL",
                    "Atendimento nao esta confirmado para inicio",
                    HttpStatus.CONFLICT
            );
        }
    }

    private void validarPodeFinalizar(AtendimentoFaxina atendimento) {
        if (checkpointServicoRepository.existsByAtendimentoIdAndTipo(atendimento.getId(), TipoCheckpointServico.FIM)
                || atendimento.getStatus() == StatusAtendimento.FINALIZADO) {
            throw new BusinessException("ATENDIMENTO_JA_FINALIZADO", "Atendimento ja foi finalizado", HttpStatus.CONFLICT);
        }
        if (atendimento.getStatus() == StatusAtendimento.CONFIRMADO
                || atendimento.getStatus() == StatusAtendimento.AGUARDANDO_PAGAMENTO) {
            throw new BusinessException("ATENDIMENTO_NAO_INICIADO", "Atendimento ainda nao foi iniciado", HttpStatus.CONFLICT);
        }
        if (atendimento.getStatus() != StatusAtendimento.EM_EXECUCAO) {
            throw new BusinessException(
                    "ATENDIMENTO_STATUS_INCOMPATIVEL",
                    "Atendimento nao esta em execucao",
                    HttpStatus.CONFLICT
            );
        }
    }

    private void registrarCheckpoint(
            AtendimentoFaxina atendimento,
            Long usuarioId,
            TipoCheckpointServico tipo,
            CheckpointServicoRequest request,
            OffsetDateTime registradoEm
    ) {
        Usuario usuario = usuarioRepository.getReferenceById(usuarioId);
        checkpointServicoRepository.save(new CheckpointServico(
                atendimento,
                tipo,
                usuario,
                request.latitude(),
                request.longitude(),
                request.fotoComprovacaoUrl(),
                request.observacao(),
                registradoEm
        ));
    }
}
