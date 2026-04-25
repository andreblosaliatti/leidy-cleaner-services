package br.com.leidycleaner.profissionais.entity;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "perfis_profissional")
public class PerfilProfissional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "nome_exibicao", nullable = false, length = 160)
    private String nomeExibicao;

    @Column(name = "cpf", nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(name = "descricao")
    private String descricao;

    @Column(name = "foto_perfil_url", length = 500)
    private String fotoPerfilUrl;

    @Column(name = "experiencia_anos", nullable = false)
    private int experienciaAnos;

    @Column(name = "ativo_para_receber_chamados", nullable = false)
    private boolean ativoParaReceberChamados;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_aprovacao", nullable = false, length = 30)
    private StatusAprovacaoProfissional statusAprovacao;

    @Column(name = "nota_media", nullable = false, precision = 3, scale = 2)
    private BigDecimal notaMedia = BigDecimal.ZERO;

    @Column(name = "total_avaliacoes", nullable = false)
    private int totalAvaliacoes;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected PerfilProfissional() {
    }

    public PerfilProfissional(
            Usuario usuario,
            String nomeExibicao,
            String cpf,
            LocalDate dataNascimento,
            String descricao,
            String fotoPerfilUrl,
            int experienciaAnos,
            boolean ativoParaReceberChamados,
            StatusAprovacaoProfissional statusAprovacao
    ) {
        this.usuario = usuario;
        this.nomeExibicao = nomeExibicao;
        this.cpf = cpf;
        this.dataNascimento = dataNascimento;
        this.descricao = descricao;
        this.fotoPerfilUrl = fotoPerfilUrl;
        this.experienciaAnos = experienciaAnos;
        this.ativoParaReceberChamados = ativoParaReceberChamados;
        this.statusAprovacao = statusAprovacao;
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

    public void atualizarPerfil(
            String nomeExibicao,
            String descricao,
            String fotoPerfilUrl,
            Integer experienciaAnos,
            Boolean ativoParaReceberChamados
    ) {
        if (nomeExibicao != null && !nomeExibicao.isBlank()) {
            this.nomeExibicao = nomeExibicao.trim();
        }
        this.descricao = descricao;
        this.fotoPerfilUrl = fotoPerfilUrl;
        if (experienciaAnos != null) {
            this.experienciaAnos = experienciaAnos;
        }
        if (ativoParaReceberChamados != null) {
            this.ativoParaReceberChamados = ativoParaReceberChamados;
        }
    }

    public void alterarStatusAprovacao(StatusAprovacaoProfissional statusAprovacao) {
        this.statusAprovacao = statusAprovacao;
    }

    public void atualizarAgregadoAvaliacoes(BigDecimal notaMedia, int totalAvaliacoes) {
        this.notaMedia = notaMedia == null ? BigDecimal.ZERO : notaMedia.setScale(2, RoundingMode.HALF_UP);
        this.totalAvaliacoes = totalAvaliacoes;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getNomeExibicao() {
        return nomeExibicao;
    }

    public String getCpf() {
        return cpf;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getFotoPerfilUrl() {
        return fotoPerfilUrl;
    }

    public int getExperienciaAnos() {
        return experienciaAnos;
    }

    public boolean isAtivoParaReceberChamados() {
        return ativoParaReceberChamados;
    }

    public StatusAprovacaoProfissional getStatusAprovacao() {
        return statusAprovacao;
    }

    public BigDecimal getNotaMedia() {
        return notaMedia;
    }

    public int getTotalAvaliacoes() {
        return totalAvaliacoes;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public OffsetDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
