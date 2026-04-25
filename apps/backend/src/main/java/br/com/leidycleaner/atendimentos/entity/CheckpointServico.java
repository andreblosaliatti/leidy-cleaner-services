package br.com.leidycleaner.atendimentos.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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
@Table(name = "checkpoints_servico")
public class CheckpointServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "atendimento_id", nullable = false)
    private AtendimentoFaxina atendimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoCheckpointServico tipo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registrado_por_usuario_id", nullable = false)
    private Usuario registradoPor;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "foto_comprovacao_url", length = 500)
    private String fotoComprovacaoUrl;

    @Column(name = "observacao")
    private String observacao;

    @Column(name = "registrado_em", nullable = false, updatable = false)
    private OffsetDateTime registradoEm;

    protected CheckpointServico() {
    }

    public CheckpointServico(
            AtendimentoFaxina atendimento,
            TipoCheckpointServico tipo,
            Usuario registradoPor,
            BigDecimal latitude,
            BigDecimal longitude,
            String fotoComprovacaoUrl,
            String observacao,
            OffsetDateTime registradoEm
    ) {
        this.atendimento = atendimento;
        this.tipo = tipo;
        this.registradoPor = registradoPor;
        this.latitude = latitude;
        this.longitude = longitude;
        this.fotoComprovacaoUrl = limparOpcional(fotoComprovacaoUrl);
        this.observacao = limparOpcional(observacao);
        this.registradoEm = registradoEm;
    }

    @PrePersist
    void aoCriar() {
        if (registradoEm == null) {
            registradoEm = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public AtendimentoFaxina getAtendimento() {
        return atendimento;
    }

    public TipoCheckpointServico getTipo() {
        return tipo;
    }

    public Usuario getRegistradoPor() {
        return registradoPor;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public String getFotoComprovacaoUrl() {
        return fotoComprovacaoUrl;
    }

    public String getObservacao() {
        return observacao;
    }

    public OffsetDateTime getRegistradoEm() {
        return registradoEm;
    }

    private String limparOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }
}
