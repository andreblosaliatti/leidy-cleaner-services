package br.com.leidycleaner.pagamentos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.pagamentos.entity.Pagamento;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    Optional<Pagamento> findByAtendimentoId(Long atendimentoId);

    Optional<Pagamento> findByGatewayPaymentId(String gatewayPaymentId);

    boolean existsByAtendimentoId(Long atendimentoId);
}
