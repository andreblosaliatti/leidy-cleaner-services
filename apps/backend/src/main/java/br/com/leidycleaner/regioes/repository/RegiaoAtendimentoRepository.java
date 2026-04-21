package br.com.leidycleaner.regioes.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.regioes.entity.RegiaoAtendimento;

public interface RegiaoAtendimentoRepository extends JpaRepository<RegiaoAtendimento, Long> {

    List<RegiaoAtendimento> findByAtivoTrueOrderByNomeAsc();

    List<RegiaoAtendimento> findByIdInAndAtivoTrue(Collection<Long> ids);

    Optional<RegiaoAtendimento> findByIdAndAtivoTrue(Long id);
}
