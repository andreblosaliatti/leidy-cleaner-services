package br.com.leidycleaner.configuracoes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.configuracoes.entity.ConfiguracaoPreco;

public interface ConfiguracaoPrecoRepository extends JpaRepository<ConfiguracaoPreco, Long> {

    Optional<ConfiguracaoPreco> findFirstByAtivoTrueOrderByAtualizadoEmDescIdDesc();

    List<ConfiguracaoPreco> findByAtivoTrueOrderByAtualizadoEmDescIdDesc();
}
