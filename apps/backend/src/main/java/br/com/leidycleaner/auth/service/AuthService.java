package br.com.leidycleaner.auth.service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.auth.dto.AuthLoginRequest;
import br.com.leidycleaner.auth.dto.AuthLoginResponse;
import br.com.leidycleaner.auth.mapper.AuthMapper;
import br.com.leidycleaner.auth.security.JwtTokenProvider;
import br.com.leidycleaner.auth.security.UsuarioDetailsService;
import br.com.leidycleaner.auth.security.UsuarioPrincipal;
import br.com.leidycleaner.usuarios.entity.Usuario;

@Service
public class AuthService {

    private final UsuarioDetailsService usuarioDetailsService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UsuarioDetailsService usuarioDetailsService,
            JwtTokenProvider jwtTokenProvider,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioDetailsService = usuarioDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthLoginResponse login(AuthLoginRequest request) {
        UsuarioPrincipal principal = (UsuarioPrincipal) usuarioDetailsService.loadUserByUsername(
                request.email().trim().toLowerCase()
        );

        if (!passwordEncoder.matches(request.senha(), principal.getPassword())) {
            throw new BadCredentialsException("Credenciais invalidas");
        }
        if (!principal.isEnabled()) {
            throw new DisabledException("Conta inativa");
        }
        if (!principal.isAccountNonLocked()) {
            throw new LockedException("Conta bloqueada");
        }

        Usuario usuario = principal.getUsuario();
        usuario.registrarLogin(OffsetDateTime.now(ZoneOffset.UTC));
        Instant expiresAt = jwtTokenProvider.calcularExpiracao();

        return new AuthLoginResponse(
                jwtTokenProvider.gerarToken(principal),
                "Bearer",
                expiresAt,
                AuthMapper.paraUsuarioAutenticado(usuario)
        );
    }
}
