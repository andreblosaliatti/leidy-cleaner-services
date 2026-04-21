package br.com.leidycleaner.verificacao.entity;

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
@Table(name = "documentos_verificacao")
public class DocumentoVerificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "tipo_documento", nullable = false, length = 40)
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = false, length = 80)
    private String numeroDocumento;

    @Column(name = "documento_frente_url", length = 500)
    private String documentoFrenteUrl;

    @Column(name = "documento_verso_url", length = 500)
    private String documentoVersoUrl;

    @Column(name = "selfie_url", length = 500)
    private String selfieUrl;

    @Column(name = "comprovante_residencia_url", length = 500)
    private String comprovanteResidenciaUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_verificacao", nullable = false, length = 30)
    private StatusVerificacao statusVerificacao;

    @Column(name = "observacao_analise")
    private String observacaoAnalise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analisado_por_usuario_id")
    private Usuario analisadoPorUsuario;

    @Column(name = "analisado_em")
    private OffsetDateTime analisadoEm;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected DocumentoVerificacao() {
    }

    public DocumentoVerificacao(Usuario usuario, String tipoDocumento, String numeroDocumento, String documentoFrenteUrl, String documentoVersoUrl, String selfieUrl, String comprovanteResidenciaUrl) {
        this.usuario = usuario;
        this.tipoDocumento = tipoDocumento;
        this.numeroDocumento = numeroDocumento;
        this.documentoFrenteUrl = documentoFrenteUrl;
        this.documentoVersoUrl = documentoVersoUrl;
        this.selfieUrl = selfieUrl;
        this.comprovanteResidenciaUrl = comprovanteResidenciaUrl;
        this.statusVerificacao = StatusVerificacao.PENDENTE;
    }

    @PrePersist
    void aoCriar() {
        criadoEm = OffsetDateTime.now();
    }

    public void analisar(StatusVerificacao statusVerificacao, String observacaoAnalise, Usuario analisadoPorUsuario) {
        this.statusVerificacao = statusVerificacao;
        this.observacaoAnalise = observacaoAnalise;
        this.analisadoPorUsuario = analisadoPorUsuario;
        this.analisadoEm = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public String getTipoDocumento() { return tipoDocumento; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public String getDocumentoFrenteUrl() { return documentoFrenteUrl; }
    public String getDocumentoVersoUrl() { return documentoVersoUrl; }
    public String getSelfieUrl() { return selfieUrl; }
    public String getComprovanteResidenciaUrl() { return comprovanteResidenciaUrl; }
    public StatusVerificacao getStatusVerificacao() { return statusVerificacao; }
    public String getObservacaoAnalise() { return observacaoAnalise; }
    public Usuario getAnalisadoPorUsuario() { return analisadoPorUsuario; }
    public OffsetDateTime getAnalisadoEm() { return analisadoEm; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
}
