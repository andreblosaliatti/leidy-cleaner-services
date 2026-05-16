package br.com.leidycleaner.notificacoes.entity;

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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "dispositivos_push")
public class DispositivoPush {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "plataforma", nullable = false, length = 30)
    private PlataformaPush plataforma;

    @Column(name = "token", nullable = false, length = 2048)
    private String token;

    @Column(name = "ativo", nullable = false)
    private boolean ativo;

    @Column(name = "ultimo_uso_em")
    private OffsetDateTime ultimoUsoEm;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected DispositivoPush() {
    }

    public DispositivoPush(Usuario usuario, PlataformaPush plataforma, String token, OffsetDateTime momento) {
        this.usuario = usuario;
        this.plataforma = plataforma;
        this.token = token;
        this.ativo = true;
        this.ultimoUsoEm = momento;
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

    public void reativar(OffsetDateTime momento) {
        ativo = true;
        ultimoUsoEm = momento;
    }

    public void desativar() {
        ativo = false;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public PlataformaPush getPlataforma() {
        return plataforma;
    }

    public String getToken() {
        return token;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public OffsetDateTime getUltimoUsoEm() {
        return ultimoUsoEm;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public OffsetDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
