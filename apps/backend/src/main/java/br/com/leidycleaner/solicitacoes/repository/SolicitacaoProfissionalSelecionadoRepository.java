package br.com.leidycleaner.solicitacoes.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.solicitacoes.entity.SolicitacaoProfissionalSelecionado;

public interface SolicitacaoProfissionalSelecionadoRepository extends JpaRepository<SolicitacaoProfissionalSelecionado, Long> {

    List<SolicitacaoProfissionalSelecionado> findBySolicitacaoIdOrderByOrdemEscolhaAsc(Long solicitacaoId);

    void deleteBySolicitacaoId(Long solicitacaoId);
}
