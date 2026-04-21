package br.com.leidycleaner.auth.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import br.com.leidycleaner.usuarios.entity.StatusConta;
import br.com.leidycleaner.usuarios.entity.Usuario;

public class UsuarioPrincipal implements UserDetails {

    private final Usuario usuario;
    private final Collection<? extends GrantedAuthority> authorities;

    public UsuarioPrincipal(Usuario usuario, Collection<? extends GrantedAuthority> authorities) {
        this.usuario = usuario;
        this.authorities = authorities;
    }

    public Long getId() {
        return usuario.getId();
    }

    public Usuario getUsuario() {
        return usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return usuario.getSenhaHash();
    }

    @Override
    public String getUsername() {
        return usuario.getEmail();
    }

    @Override
    public boolean isAccountNonLocked() {
        return usuario.getStatusConta() != StatusConta.BLOQUEADA;
    }

    @Override
    public boolean isEnabled() {
        return usuario.getStatusConta() != StatusConta.INATIVA;
    }
}
