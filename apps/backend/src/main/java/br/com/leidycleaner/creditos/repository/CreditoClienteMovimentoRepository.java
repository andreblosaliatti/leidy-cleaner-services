package br.com.leidycleaner.creditos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.leidycleaner.creditos.entity.CreditoClienteMovimento;
import br.com.leidycleaner.creditos.entity.TipoMovimentoCreditoCliente;

public interface CreditoClienteMovimentoRepository extends JpaRepository<CreditoClienteMovimento, Long> {

    Optional<CreditoClienteMovimento> findByPagamentoOrigemIdAndTipoMovimento(
            Long pagamentoOrigemId,
            TipoMovimentoCreditoCliente tipoMovimento
    );

    boolean existsByPagamentoOrigemIdAndTipoMovimento(
            Long pagamentoOrigemId,
            TipoMovimentoCreditoCliente tipoMovimento
    );

    long countByPagamentoOrigemIdAndTipoMovimento(
            Long pagamentoOrigemId,
            TipoMovimentoCreditoCliente tipoMovimento
    );

    Optional<CreditoClienteMovimento> findTopByClienteIdOrderByCriadoEmDescIdDesc(Long clienteId);
}
