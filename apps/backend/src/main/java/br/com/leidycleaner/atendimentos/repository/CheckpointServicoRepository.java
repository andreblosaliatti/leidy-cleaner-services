package br.com.leidycleaner.atendimentos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.atendimentos.entity.CheckpointServico;
import br.com.leidycleaner.atendimentos.entity.TipoCheckpointServico;

public interface CheckpointServicoRepository extends JpaRepository<CheckpointServico, Long> {

    List<CheckpointServico> findByAtendimentoIdOrderByRegistradoEmAscIdAsc(Long atendimentoId);

    boolean existsByAtendimentoIdAndTipo(Long atendimentoId, TipoCheckpointServico tipo);
}
