package br.com.leidycleaner.auth.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;
    private final SecretKey secretKey;

    public JwtTokenProvider(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.secretKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String gerarToken(UsuarioPrincipal principal) {
        Instant agora = Instant.now();
        Instant expiraEm = agora.plusSeconds(jwtProperties.expirationSeconds());
        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return Jwts.builder()
                .subject(principal.getUsername())
                .claim("usuarioId", principal.getId())
                .claim("roles", roles)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(expiraEm))
                .signWith(secretKey)
                .compact();
    }

    public String obterEmail(String token) {
        return obterClaims(token).getSubject();
    }

    public Instant calcularExpiracao() {
        return Instant.now().plusSeconds(jwtProperties.expirationSeconds());
    }

    private Claims obterClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
