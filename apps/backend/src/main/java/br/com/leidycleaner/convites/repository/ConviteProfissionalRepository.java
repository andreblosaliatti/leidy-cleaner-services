package br.com.leidycleaner.convites.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.leidycleaner.convites.entity.ConviteProfissional;
import jakarta.persistence.LockModeType;

public interface ConviteProfissionalRepository extends JpaRepository<ConviteProfissional, Long> {

    List<ConviteProfissional> findByProfissionalUsuarioIdOrderByEnviadoEmDescIdDesc(Long usuarioId);

    Optional<ConviteProfissional> findByIdAndProfissionalUsuarioId(Long id, Long usuarioId);

    @Query("""
            select convite.solicitacao.id
            from ConviteProfissional convite
            where convite.id = :id
              and convite.profissional.usuario.id = :usuarioId
            """)
    Optional<Long> findSolicitacaoIdByIdAndProfissionalUsuarioId(
            @Param("id") Long id,
            @Param("usuarioId") Long usuarioId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select convite
            from ConviteProfissional convite
            where convite.id = :id
              and convite.profissional.usuario.id = :usuarioId
            """)
    Optional<ConviteProfissional> findByIdAndProfissionalUsuarioIdForUpdate(
            @Param("id") Long id,
            @Param("usuarioId") Long usuarioId
    );

    List<ConviteProfissional> findBySolicitacaoId(Long solicitacaoId);

    void deleteBySolicitacaoId(Long solicitacaoId);
}
