package br.com.leidycleaner.auth.dto;

import java.time.Instant;

public record AuthLoginResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        UsuarioAutenticadoDto usuario
) {
}
