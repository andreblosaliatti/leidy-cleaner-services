package br.com.leidycleaner.clientes.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.leidycleaner.clientes.entity.PerfilCliente;
import jakarta.persistence.LockModeType;

public interface PerfilClienteRepository extends JpaRepository<PerfilCliente, Long> {

    Optional<PerfilCliente> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioId(Long usuarioId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select cliente
            from PerfilCliente cliente
            where cliente.id = :id
            """)
    Optional<PerfilCliente> findByIdForUpdate(@Param("id") Long id);
}
