package br.com.leidycleaner.usuarios.dto;

import java.time.OffsetDateTime;
import java.util.Set;

import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.TipoUsuario;

public record UsuarioResumoDto(
        Long id,
        String nomeCompleto,
        String email,
        String telefone,
        TipoUsuario tipoUsuario,
        StatusConta statusConta,
        boolean emailVerificado,
        boolean telefoneVerificado,
        OffsetDateTime ultimoLoginEm,
        Set<String> roles
) {
}
