package br.com.leidycleaner.atendimentos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;

public interface AtendimentoFaxinaRepository extends JpaRepository<AtendimentoFaxina, Long> {

    Optional<AtendimentoFaxina> findBySolicitacaoId(Long solicitacaoId);

    boolean existsBySolicitacaoId(Long solicitacaoId);
}
