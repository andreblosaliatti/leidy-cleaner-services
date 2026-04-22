package br.com.leidycleaner.solicitacoes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;
import jakarta.persistence.LockModeType;

public interface SolicitacaoFaxinaRepository extends JpaRepository<SolicitacaoFaxina, Long> {

    List<SolicitacaoFaxina> findByClienteUsuarioIdOrderByCriadoEmDescIdDesc(Long usuarioId);

    Optional<SolicitacaoFaxina> findByIdAndClienteUsuarioId(Long id, Long usuarioId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select solicitacao from SolicitacaoFaxina solicitacao where solicitacao.id = :id")
    Optional<SolicitacaoFaxina> findByIdForUpdate(@Param("id") Long id);
}
