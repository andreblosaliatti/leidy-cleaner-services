package br.com.leidycleaner.profissionais.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.profissionais.entity.PerfilProfissional;

public interface PerfilProfissionalRepository extends JpaRepository<PerfilProfissional, Long> {

    Optional<PerfilProfissional> findByUsuarioId(Long usuarioId);

    Optional<PerfilProfissional> findByCpf(String cpf);

    boolean existsByCpf(String cpf);
}
