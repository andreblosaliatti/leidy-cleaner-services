package br.com.leidycleaner.usuarios.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.usuarios.dto.AlterarStatusUsuarioRequest;
import br.com.leidycleaner.usuarios.dto.UsuarioResumoDto;
import br.com.leidycleaner.usuarios.mapper.UsuarioMapper;
import br.com.leidycleaner.usuarios.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public boolean emailJaCadastrado(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public Optional<UsuarioResumoDto> buscarResumoPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .map(UsuarioMapper::paraResumo);
    }

    @Transactional
    public UsuarioResumoDto alterarStatus(Long usuarioId, AlterarStatusUsuarioRequest request) {
        return usuarioRepository.findById(usuarioId)
                .map(usuario -> {
                    usuario.alterarStatusConta(request.statusConta());
                    return UsuarioMapper.paraResumo(usuario);
                })
                .orElseThrow(() -> new BusinessException("USUARIO_NOT_FOUND", "Usuario nao encontrado"));
    }
}
