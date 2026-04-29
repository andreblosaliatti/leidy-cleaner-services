package br.com.leidycleaner.pagamentos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.leidycleaner.pagamentos.entity.MetodoPagamento;
import br.com.leidycleaner.pagamentos.entity.Pagamento;
import br.com.leidycleaner.pagamentos.entity.StatusPagamento;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    @Query("""
            select p
            from Pagamento p
            join fetch p.atendimento a
            join fetch a.cliente c
            join fetch c.usuario
            where (:status is null or p.status = :status)
              and (:metodoPagamento is null or p.metodoPagamento = :metodoPagamento)
              and (:atendimentoId is null or a.id = :atendimentoId)
            order by p.criadoEm desc, p.id desc
            """)
    List<Pagamento> findAdminList(
            @Param("status") StatusPagamento status,
            @Param("metodoPagamento") MetodoPagamento metodoPagamento,
            @Param("atendimentoId") Long atendimentoId
    );

    Optional<Pagamento> findByAtendimentoId(Long atendimentoId);

    Optional<Pagamento> findByGatewayPaymentId(String gatewayPaymentId);

    boolean existsByAtendimentoId(Long atendimentoId);
}
