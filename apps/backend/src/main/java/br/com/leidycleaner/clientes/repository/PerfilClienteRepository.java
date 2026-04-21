package br.com.leidycleaner.clientes.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.clientes.entity.PerfilCliente;

public interface PerfilClienteRepository extends JpaRepository<PerfilCliente, Long> {

    Optional<PerfilCliente> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioId(Long usuarioId);
}
