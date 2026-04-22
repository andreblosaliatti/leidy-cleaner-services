package br.com.leidycleaner.convites.entity;

import java.time.OffsetDateTime;

import br.com.leidycleaner.profissionais.entity.PerfilProfissional;
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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "convites_profissional",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_convites_profissional_solicitacao_profissional",
                columnNames = {"solicitacao_id", "profissional_id"}
        )
)
public class ConviteProfissional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private SolicitacaoFaxina solicitacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profissional_id", nullable = false)
    private PerfilProfissional profissional;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusConvite status;

    @Column(name = "enviado_em", nullable = false)
    private OffsetDateTime enviadoEm;

    @Column(name = "visualizado_em")
    private OffsetDateTime visualizadoEm;

    @Column(name = "respondido_em")
    private OffsetDateTime respondidoEm;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    protected ConviteProfissional() {
    }

    public ConviteProfissional(
            SolicitacaoFaxina solicitacao,
            PerfilProfissional profissional,
            OffsetDateTime enviadoEm,
            OffsetDateTime expiraEm
    ) {
        this.solicitacao = solicitacao;
        this.profissional = profissional;
        this.status = StatusConvite.ENVIADO;
        this.enviadoEm = enviadoEm;
        this.expiraEm = expiraEm;
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

    public StatusConvite getStatus() {
        return status;
    }

    public OffsetDateTime getEnviadoEm() {
        return enviadoEm;
    }

    public OffsetDateTime getVisualizadoEm() {
        return visualizadoEm;
    }

    public OffsetDateTime getRespondidoEm() {
        return respondidoEm;
    }

    public OffsetDateTime getExpiraEm() {
        return expiraEm;
    }

    public boolean podeResponder() {
        return status == StatusConvite.ENVIADO || status == StatusConvite.VISUALIZADO;
    }

    public boolean expiradoEm(OffsetDateTime agora) {
        return !expiraEm.isAfter(agora);
    }

    public void aceitar(OffsetDateTime respondidoEm) {
        status = StatusConvite.ACEITO;
        this.respondidoEm = respondidoEm;
    }

    public void recusar(OffsetDateTime respondidoEm) {
        status = StatusConvite.RECUSADO;
        this.respondidoEm = respondidoEm;
    }

    public void cancelar(OffsetDateTime respondidoEm) {
        if (podeResponder()) {
            status = StatusConvite.CANCELADO;
            this.respondidoEm = respondidoEm;
        }
    }

    public void expirar(OffsetDateTime respondidoEm) {
        if (podeResponder()) {
            status = StatusConvite.EXPIRADO;
            this.respondidoEm = respondidoEm;
        }
    }
}
