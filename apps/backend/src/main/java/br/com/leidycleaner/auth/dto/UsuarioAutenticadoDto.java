package br.com.leidycleaner.auth.dto;

import java.util.Set;

import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;

public record UsuarioAutenticadoDto(
        Long id,
        String nomeCompleto,
        String email,
        TipoUsuario tipoUsuario,
        StatusConta statusConta,
        Set<String> roles
) {
}
