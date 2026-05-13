package br.com.leidycleaner.creditos.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.clientes.entity.PerfilCliente;
import br.com.leidycleaner.clientes.repository.PerfilClienteRepository;
import br.com.leidycleaner.core.exception.BusinessException;
import br.com.leidycleaner.creditos.entity.CreditoClienteMovimento;
import br.com.leidycleaner.creditos.entity.TipoMovimentoCreditoCliente;
import br.com.leidycleaner.creditos.repository.CreditoClienteMovimentoRepository;
import br.com.leidycleaner.pagamentos.entity.Pagamento;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;

@Service
public class CreditoClienteService {

    private final CreditoClienteMovimentoRepository creditoClienteMovimentoRepository;
    private final PerfilClienteRepository perfilClienteRepository;

    public CreditoClienteService(
            CreditoClienteMovimentoRepository creditoClienteMovimentoRepository,
            PerfilClienteRepository perfilClienteRepository
    ) {
        this.creditoClienteMovimentoRepository = creditoClienteMovimentoRepository;
        this.perfilClienteRepository = perfilClienteRepository;
    }

    @Transactional
    public CreditoClienteMovimento gerarCreditoSemAceite(
            SolicitacaoFaxina solicitacao,
            Pagamento pagamento,
            String observacao
    ) {
        return creditoClienteMovimentoRepository.findByPagamentoOrigemIdAndTipoMovimento(
                        pagamento.getId(),
                        TipoMovimentoCreditoCliente.CREDITO_GERADO_SEM_ACEITE
                )
                .orElseGet(() -> criarNovoCreditoSemAceite(solicitacao, pagamento, observacao));
    }

    private CreditoClienteMovimento criarNovoCreditoSemAceite(
            SolicitacaoFaxina solicitacao,
            Pagamento pagamento,
            String observacao
    ) {
        PerfilCliente cliente = perfilClienteRepository.findByIdForUpdate(solicitacao.getCliente().getId())
                .orElseThrow(() -> new BusinessException(
                        "CLIENTE_NOT_FOUND",
                        "Cliente da solicitacao nao encontrado"
                ));

        BigDecimal saldoAnterior = creditoClienteMovimentoRepository
                .findTopByClienteIdOrderByCriadoEmDescIdDesc(cliente.getId())
                .map(CreditoClienteMovimento::getSaldoResultante)
                .orElse(BigDecimal.ZERO);
        BigDecimal valorCredito = pagamento.getValorBruto();
        BigDecimal saldoResultante = saldoAnterior.add(valorCredito);

        return creditoClienteMovimentoRepository.saveAndFlush(new CreditoClienteMovimento(
                cliente,
                solicitacao,
                pagamento,
                null,
                TipoMovimentoCreditoCliente.CREDITO_GERADO_SEM_ACEITE,
                valorCredito,
                saldoResultante,
                observacao
        ));
    }
}
