package br.com.leidycleaner.solicitacoes.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.leidycleaner.solicitacoes.entity.StatusSolicitacao;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;
import br.com.leidycleaner.solicitacoes.entity.TipoServico;
import jakarta.persistence.LockModeType;

public interface SolicitacaoFaxinaRepository extends JpaRepository<SolicitacaoFaxina, Long> {

    List<SolicitacaoFaxina> findByClienteUsuarioIdOrderByCriadoEmDescIdDesc(Long usuarioId);

    Optional<SolicitacaoFaxina> findByIdAndClienteUsuarioId(Long id, Long usuarioId);

    @Query("""
            select solicitacao
            from SolicitacaoFaxina solicitacao
            join fetch solicitacao.cliente cliente
            join fetch solicitacao.endereco endereco
            join fetch solicitacao.regiao regiao
            where (:status is null or solicitacao.status = :status)
              and (:clienteId is null or cliente.id = :clienteId)
              and (:regiaoId is null or regiao.id = :regiaoId)
              and (:tipoServico is null or solicitacao.tipoServico = :tipoServico)
            order by solicitacao.criadoEm desc, solicitacao.id desc
            """)
    List<SolicitacaoFaxina> findAdminList(
            @Param("status") StatusSolicitacao status,
            @Param("clienteId") Long clienteId,
            @Param("regiaoId") Long regiaoId,
            @Param("tipoServico") TipoServico tipoServico
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select solicitacao from SolicitacaoFaxina solicitacao where solicitacao.id = :id")
    Optional<SolicitacaoFaxina> findByIdForUpdate(@Param("id") Long id);
}
