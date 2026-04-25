package br.com.leidycleaner.avaliacoes.entity;

import java.time.OffsetDateTime;

import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.clientes.entity.PerfilCliente;
import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "avaliacoes_profissional")
public class AvaliacaoProfissional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "atendimento_id", nullable = false, unique = true)
    private AtendimentoFaxina atendimento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private PerfilCliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profissional_id", nullable = false)
    private PerfilProfissional profissional;

    @Column(name = "nota", nullable = false)
    private int nota;

    @Column(name = "comentario")
    private String comentario;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected AvaliacaoProfissional() {
    }

    public AvaliacaoProfissional(
            AtendimentoFaxina atendimento,
            PerfilCliente cliente,
            PerfilProfissional profissional,
            int nota,
            String comentario
    ) {
        this.atendimento = atendimento;
        this.cliente = cliente;
        this.profissional = profissional;
        this.nota = nota;
        this.comentario = limparOpcional(comentario);
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

    public AtendimentoFaxina getAtendimento() {
        return atendimento;
    }

    public PerfilCliente getCliente() {
        return cliente;
    }

    public PerfilProfissional getProfissional() {
        return profissional;
    }

    public int getNota() {
        return nota;
    }

    public String getComentario() {
        return comentario;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public OffsetDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    private String limparOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }
}
