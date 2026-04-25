package br.com.leidycleaner.ocorrencias.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.atendimentos.repository.AtendimentoFaxinaRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.ocorrencias.dto.AtualizarStatusOcorrenciaRequest;
import br.com.leidycleaner.ocorrencias.dto.OcorrenciaAtendimentoDto;
import br.com.leidycleaner.ocorrencias.dto.OcorrenciaAtendimentoRequest;
import br.com.leidycleaner.ocorrencias.entity.OcorrenciaAtendimento;
import br.com.leidycleaner.ocorrencias.mapper.OcorrenciaAtendimentoMapper;
import br.com.leidycleaner.ocorrencias.repository.OcorrenciaAtendimentoRepository;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;
import br.com.leidycleaner.usuarios.entity.Usuario;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;

@Service
public class OcorrenciaAtendimentoService {

    private final OcorrenciaAtendimentoRepository ocorrenciaAtendimentoRepository;
    private final AtendimentoFaxinaRepository atendimentoFaxinaRepository;
    private final UsuarioRepository usuarioRepository;

    public OcorrenciaAtendimentoService(
            OcorrenciaAtendimentoRepository ocorrenciaAtendimentoRepository,
            AtendimentoFaxinaRepository atendimentoFaxinaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.ocorrenciaAtendimentoRepository = ocorrenciaAtendimentoRepository;
        this.atendimentoFaxinaRepository = atendimentoFaxinaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public OcorrenciaAtendimentoDto criar(Long usuarioId, OcorrenciaAtendimentoRequest request) {
        Usuario usuario = buscarUsuario(usuarioId);
        AtendimentoFaxina atendimento = atendimentoFaxinaRepository.findById(request.atendimentoId())
                .orElseThrow(() -> new BusinessException(
                        "ATENDIMENTO_NOT_FOUND",
                        "Atendimento nao encontrado",
                        HttpStatus.NOT_FOUND
                ));
        if (!podeAbrir(usuario, atendimento)) {
            throw new BusinessException(
                    "ATENDIMENTO_NOT_FOUND",
                    "Atendimento nao encontrado",
                    HttpStatus.NOT_FOUND
            );
        }

        OcorrenciaAtendimento ocorrencia = ocorrenciaAtendimentoRepository.save(new OcorrenciaAtendimento(
                atendimento,
                usuario,
                request.tipo(),
                request.descricao()
        ));
        return OcorrenciaAtendimentoMapper.paraDto(ocorrencia);
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaAtendimentoDto> listarMinhas(Long usuarioId) {
        return ocorrenciaAtendimentoRepository.findByAbertoPorIdOrderByCriadoEmDescIdDesc(usuarioId)
                .stream()
                .map(OcorrenciaAtendimentoMapper::paraDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public OcorrenciaAtendimentoDto buscarVisivel(Long usuarioId, Long ocorrenciaId) {
        Usuario usuario = buscarUsuario(usuarioId);
        OcorrenciaAtendimento ocorrencia = buscarOcorrencia(ocorrenciaId);
        if (!podeVisualizar(usuario, ocorrencia)) {
            throw new BusinessException(
                    "OCORRENCIA_NOT_FOUND",
                    "Ocorrencia nao encontrada",
                    HttpStatus.NOT_FOUND
            );
        }
        return OcorrenciaAtendimentoMapper.paraDto(ocorrencia);
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaAtendimentoDto> listarTodas() {
        return ocorrenciaAtendimentoRepository.findAllByOrderByCriadoEmDescIdDesc()
                .stream()
                .map(OcorrenciaAtendimentoMapper::paraDto)
                .toList();
    }

    @Transactional
    public OcorrenciaAtendimentoDto alterarStatus(
            Long adminUsuarioId,
            Long ocorrenciaId,
            AtualizarStatusOcorrenciaRequest request
    ) {
        Usuario admin = buscarUsuario(adminUsuarioId);
        OcorrenciaAtendimento ocorrencia = buscarOcorrencia(ocorrenciaId);
        ocorrencia.alterarStatus(request.status(), admin, OffsetDateTime.now());
        return OcorrenciaAtendimentoMapper.paraDto(ocorrencia);
    }

    private Usuario buscarUsuario(Long usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new BusinessException(
                        "USUARIO_NOT_FOUND",
                        "Usuario nao encontrado",
                        HttpStatus.NOT_FOUND
                ));
    }

    private OcorrenciaAtendimento buscarOcorrencia(Long ocorrenciaId) {
        return ocorrenciaAtendimentoRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new BusinessException(
                        "OCORRENCIA_NOT_FOUND",
                        "Ocorrencia nao encontrada",
                        HttpStatus.NOT_FOUND
                ));
    }

    private boolean podeAbrir(Usuario usuario, AtendimentoFaxina atendimento) {
        return isAdmin(usuario) || isRelacionado(usuario, atendimento);
    }

    private boolean podeVisualizar(Usuario usuario, OcorrenciaAtendimento ocorrencia) {
        return isAdmin(usuario)
                || ocorrencia.getAbertoPor().getId().equals(usuario.getId())
                || isRelacionado(usuario, ocorrencia.getAtendimento());
    }

    private boolean isRelacionado(Usuario usuario, AtendimentoFaxina atendimento) {
        return atendimento.getCliente().getUsuario().getId().equals(usuario.getId())
                || atendimento.getProfissional().getUsuario().getId().equals(usuario.getId());
    }

    private boolean isAdmin(Usuario usuario) {
        return usuario.getTipoUsuario() == TipoUsuario.ADMIN;
    }
}
