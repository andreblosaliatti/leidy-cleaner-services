package br.com.leidycleaner.usuarios.dto;

import br.com.leidycleaner.auth.dto.UsuarioAutenticadoDto;

public record CadastroUsuarioResponse(
        UsuarioAutenticadoDto usuario,
        Long perfilId
) {
}
