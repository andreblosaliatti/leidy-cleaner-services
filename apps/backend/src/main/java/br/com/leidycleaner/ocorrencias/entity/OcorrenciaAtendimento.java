package br.com.leidycleaner.ocorrencias.entity;

import java.time.OffsetDateTime;

import br.com.leidycleaner.atendimentos.entity.AtendimentoFaxina;
import br.com.leidycleaner.usuarios.entity.Usuario;
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
@Table(name = "ocorrencias_atendimento")
public class OcorrenciaAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "atendimento_id", nullable = false)
    private AtendimentoFaxina atendimento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aberto_por_usuario_id", nullable = false)
    private Usuario abertoPor;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 40)
    private TipoOcorrencia tipo;

    @Column(name = "descricao", nullable = false)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusOcorrencia status;

    @Column(name = "resolvido_em")
    private OffsetDateTime resolvidoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolvido_por_usuario_id")
    private Usuario resolvidoPor;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected OcorrenciaAtendimento() {
    }

    public OcorrenciaAtendimento(
            AtendimentoFaxina atendimento,
            Usuario abertoPor,
            TipoOcorrencia tipo,
            String descricao
    ) {
        this.atendimento = atendimento;
        this.abertoPor = abertoPor;
        this.tipo = tipo;
        this.descricao = descricao.trim();
        this.status = StatusOcorrencia.ABERTA;
    }

    @PrePersist
    void aoCriar() {
        criadoEm = OffsetDateTime.now();
    }

    public void alterarStatus(StatusOcorrencia status, Usuario resolvidoPor, OffsetDateTime momento) {
        this.status = status;
        if (status == StatusOcorrencia.RESOLVIDA) {
            this.resolvidoEm = momento;
            this.resolvidoPor = resolvidoPor;
            return;
        }
        this.resolvidoEm = null;
        this.resolvidoPor = null;
    }

    public Long getId() {
        return id;
    }

    public AtendimentoFaxina getAtendimento() {
        return atendimento;
    }

    public Usuario getAbertoPor() {
        return abertoPor;
    }

    public TipoOcorrencia getTipo() {
        return tipo;
    }

    public String getDescricao() {
        return descricao;
    }

    public StatusOcorrencia getStatus() {
        return status;
    }

    public OffsetDateTime getResolvidoEm() {
        return resolvidoEm;
    }

    public Usuario getResolvidoPor() {
        return resolvidoPor;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }
}
