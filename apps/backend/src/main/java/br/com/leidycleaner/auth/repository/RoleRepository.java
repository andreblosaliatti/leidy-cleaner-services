package br.com.leidycleaner.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.auth.entity.Role;
import br.com.leidycleaner.auth.entity.RoleName;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByNome(RoleName nome);
}
