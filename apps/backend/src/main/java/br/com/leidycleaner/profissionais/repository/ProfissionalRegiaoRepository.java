package br.com.leidycleaner.profissionais.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.profissionais.entity.ProfissionalRegiao;

public interface ProfissionalRegiaoRepository extends JpaRepository<ProfissionalRegiao, Long> {

    List<ProfissionalRegiao> findByProfissionalIdOrderByRegiaoNomeAsc(Long profissionalId);

    void deleteByProfissionalId(Long profissionalId);
}
