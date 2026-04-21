package br.com.leidycleaner.usuarios.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
