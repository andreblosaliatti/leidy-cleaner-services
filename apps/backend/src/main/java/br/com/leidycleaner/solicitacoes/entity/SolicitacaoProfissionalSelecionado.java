package br.com.leidycleaner.solicitacoes.entity;

import java.time.OffsetDateTime;

import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "solicitacao_profissionais_selecionados",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_solicitacao_profissionais_selecionados_profissional", columnNames = {"solicitacao_id", "profissional_id"}),
                @UniqueConstraint(name = "uk_solicitacao_profissionais_selecionados_ordem", columnNames = {"solicitacao_id", "ordem_escolha"})
        }
)
public class SolicitacaoProfissionalSelecionado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private SolicitacaoFaxina solicitacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profissional_id", nullable = false)
    private PerfilProfissional profissional;

    @Column(name = "ordem_escolha", nullable = false)
    private int ordemEscolha;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected SolicitacaoProfissionalSelecionado() {
    }

    public SolicitacaoProfissionalSelecionado(
            SolicitacaoFaxina solicitacao,
            PerfilProfissional profissional,
            int ordemEscolha
    ) {
        this.solicitacao = solicitacao;
        this.profissional = profissional;
        this.ordemEscolha = ordemEscolha;
    }

    @PrePersist
    void aoCriar() {
        criadoEm = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public SolicitacaoFaxina getSolicitacao() {
        return solicitacao;
    }

    public PerfilProfissional getProfissional() {
        return profissional;
    }

    public int getOrdemEscolha() {
        return ordemEscolha;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }
}
