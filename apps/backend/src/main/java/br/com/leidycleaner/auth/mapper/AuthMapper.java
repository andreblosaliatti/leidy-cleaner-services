package br.com.leidycleaner.auth.mapper;

import java.util.stream.Collectors;

import br.com.leidycleaner.auth.dto.UsuarioAutenticadoDto;
import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.usuarios.entity.Usuario;

public final class AuthMapper {

    private AuthMapper() {
    }

    public static UsuarioAutenticadoDto paraUsuarioAutenticado(Usuario usuario) {
        return new UsuarioAutenticadoDto(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getEmail(),
                usuario.getTipoUsuario(),
                usuario.getStatusConta(),
                usuario.getRoles().stream()
                        .map(role -> role.getNome().name())
                        .collect(Collectors.toUnmodifiableSet())
        );
    }

    public static UsuarioAutenticadoDto paraUsuarioAutenticado(UsuarioPrincipal principal) {
        return paraUsuarioAutenticado(principal.getUsuario());
    }
}
