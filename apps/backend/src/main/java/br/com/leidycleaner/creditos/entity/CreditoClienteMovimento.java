package br.com.leidycleaner.creditos.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

import br.com.leidycleaner.clientes.entity.PerfilCliente;
import br.com.leidycleaner.pagamentos.entity.Pagamento;
import br.com.leidycleaner.solicitacoes.entity.SolicitacaoFaxina;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "creditos_cliente_movimentos")
public class CreditoClienteMovimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private PerfilCliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_origem_id")
    private SolicitacaoFaxina solicitacaoOrigem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pagamento_origem_id")
    private Pagamento pagamentoOrigem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_uso_id")
    private SolicitacaoFaxina solicitacaoUso;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimento", nullable = false, length = 60)
    private TipoMovimentoCreditoCliente tipoMovimento;

    @Column(name = "valor", nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(name = "saldo_resultante", nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoResultante;

    @Column(name = "observacao")
    private String observacao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    protected CreditoClienteMovimento() {
    }

    public CreditoClienteMovimento(
            PerfilCliente cliente,
            SolicitacaoFaxina solicitacaoOrigem,
            Pagamento pagamentoOrigem,
            SolicitacaoFaxina solicitacaoUso,
            TipoMovimentoCreditoCliente tipoMovimento,
            BigDecimal valor,
            BigDecimal saldoResultante,
            String observacao
    ) {
        this.cliente = Objects.requireNonNull(cliente, "cliente");
        this.solicitacaoOrigem = solicitacaoOrigem;
        this.pagamentoOrigem = pagamentoOrigem;
        this.solicitacaoUso = solicitacaoUso;
        this.tipoMovimento = Objects.requireNonNull(tipoMovimento, "tipoMovimento");
        this.valor = Objects.requireNonNull(valor, "valor");
        this.saldoResultante = Objects.requireNonNull(saldoResultante, "saldoResultante");
        this.observacao = limparOpcional(observacao);
    }

    @PrePersist
    void aoCriar() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public PerfilCliente getCliente() {
        return cliente;
    }

    public SolicitacaoFaxina getSolicitacaoOrigem() {
        return solicitacaoOrigem;
    }

    public Pagamento getPagamentoOrigem() {
        return pagamentoOrigem;
    }

    public SolicitacaoFaxina getSolicitacaoUso() {
        return solicitacaoUso;
    }

    public TipoMovimentoCreditoCliente getTipoMovimento() {
        return tipoMovimento;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public BigDecimal getSaldoResultante() {
        return saldoResultante;
    }

    public String getObservacao() {
        return observacao;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    private String limparOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }
}
