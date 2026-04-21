package br.com.leidycleaner.solicitacoes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;

public interface SolicitacaoFaxinaRepository extends JpaRepository<SolicitacaoFaxina, Long> {

    List<SolicitacaoFaxina> findByClienteUsuarioIdOrderByCriadoEmDescIdDesc(Long usuarioId);

    Optional<SolicitacaoFaxina> findByIdAndClienteUsuarioId(Long id, Long usuarioId);
}
