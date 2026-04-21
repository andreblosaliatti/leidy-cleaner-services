package br.com.leidycleaner.profissionais.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.profissionais.entity.DisponibilidadeProfissional;

public interface DisponibilidadeProfissionalRepository extends JpaRepository<DisponibilidadeProfissional, Long> {

    List<DisponibilidadeProfissional> findByProfissionalIdOrderByDiaSemanaAscHoraInicioAsc(Long profissionalId);

    Optional<DisponibilidadeProfissional> findByIdAndProfissionalId(Long id, Long profissionalId);
}
