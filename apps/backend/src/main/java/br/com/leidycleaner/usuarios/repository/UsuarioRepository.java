package br.com.leidycleaner.usuarios.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.usuarios.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = "roles")
    Optional<Usuario> findByEmail(String email);
}
