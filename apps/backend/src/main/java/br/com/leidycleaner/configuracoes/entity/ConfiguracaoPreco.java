package br.com.leidycleaner.configuracoes.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "configuracoes_preco")
public class ConfiguracaoPreco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "valor_hora", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorHora;

    @Column(name = "percentual_comissao_agencia", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentualComissaoAgencia;

    @Column(name = "ativo", nullable = false)
    private boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected ConfiguracaoPreco() {
    }

    public ConfiguracaoPreco(BigDecimal valorHora, BigDecimal percentualComissaoAgencia) {
        this.valorHora = valorHora;
        this.percentualComissaoAgencia = percentualComissaoAgencia;
        this.ativo = true;
    }

    @PrePersist
    void aoCriar() {
        OffsetDateTime agora = OffsetDateTime.now();
        criadoEm = agora;
        atualizadoEm = agora;
    }

    @PreUpdate
    void aoAtualizar() {
        atualizadoEm = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getValorHora() {
        return valorHora;
    }

    public BigDecimal getPercentualComissaoAgencia() {
        return percentualComissaoAgencia;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public OffsetDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void atualizarValores(BigDecimal valorHora, BigDecimal percentualComissaoAgencia) {
        this.valorHora = valorHora;
        this.percentualComissaoAgencia = percentualComissaoAgencia;
        this.ativo = true;
    }

    public void desativar() {
        this.ativo = false;
    }
}
