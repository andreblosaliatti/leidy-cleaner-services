package br.com.leidycleaner.usuarios.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.usuarios.dto.AdminUsuarioResponse;
import br.com.leidycleaner.usuarios.dto.AlterarStatusUsuarioRequest;
import br.com.leidycleaner.usuarios.dto.UsuarioResumoDto;
import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;
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

    @Transactional(readOnly = true)
    public List<AdminUsuarioResponse> listarAdmin(
            TipoUsuario tipoUsuario,
            StatusConta statusConta,
            String search
    ) {
        String searchTerm = normalizarBusca(search);

        return usuarioRepository.findAdminResponses(tipoUsuario, statusConta, searchTerm);
    }

    @Transactional(readOnly = true)
    public AdminUsuarioResponse buscarAdmin(Long usuarioId) {
        return usuarioRepository.findAdminResponseById(usuarioId)
                .orElseThrow(() -> new BusinessException("USUARIO_NOT_FOUND", "Usuario nao encontrado"));
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

    private String normalizarBusca(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }

        return "%" + search.trim().toLowerCase() + "%";
    }
}
