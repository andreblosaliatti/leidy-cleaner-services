package br.com.leidycleaner.atendimentos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.atendimentos.entity.StatusAtendimento;

public interface AtendimentoFaxinaRepository extends JpaRepository<AtendimentoFaxina, Long> {

    Optional<AtendimentoFaxina> findBySolicitacaoId(Long solicitacaoId);

    boolean existsBySolicitacaoId(Long solicitacaoId);

    @Query("""
            select a
            from AtendimentoFaxina a
            where a.cliente.usuario.id = :usuarioId
               or a.profissional.usuario.id = :usuarioId
            order by a.inicioPrevistoEm desc, a.id desc
            """)
    List<AtendimentoFaxina> findRelacionadosByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query("""
            select a
            from AtendimentoFaxina a
            join fetch a.solicitacao s
            join fetch a.cliente c
            join fetch a.profissional p
            where (:status is null or a.status = :status)
              and (:clienteId is null or c.id = :clienteId)
              and (:profissionalId is null or p.id = :profissionalId)
            order by a.inicioPrevistoEm desc, a.id desc
            """)
    List<AtendimentoFaxina> findAdminList(
            @Param("status") StatusAtendimento status,
            @Param("clienteId") Long clienteId,
            @Param("profissionalId") Long profissionalId
    );

    @Query("""
            select a
            from AtendimentoFaxina a
            where a.id = :id
              and (
                  a.cliente.usuario.id = :usuarioId
                  or a.profissional.usuario.id = :usuarioId
              )
            """)
    Optional<AtendimentoFaxina> findRelacionadoByIdAndUsuarioId(
            @Param("id") Long id,
            @Param("usuarioId") Long usuarioId
    );
}
