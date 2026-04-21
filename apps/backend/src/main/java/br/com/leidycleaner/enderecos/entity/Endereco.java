package br.com.leidycleaner.enderecos.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import br.com.leidycleaner.usuarios.entity.Usuario;
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

@Entity
@Table(name = "enderecos")
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "cep", nullable = false, length = 20)
    private String cep;

    @Column(name = "logradouro", nullable = false, length = 180)
    private String logradouro;

    @Column(name = "numero", nullable = false, length = 30)
    private String numero;

    @Column(name = "complemento", length = 120)
    private String complemento;

    @Column(name = "bairro", nullable = false, length = 120)
    private String bairro;

    @Column(name = "cidade", nullable = false, length = 120)
    private String cidade;

    @Column(name = "estado", nullable = false, length = 2)
    private String estado;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "principal", nullable = false)
    private boolean principal;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected Endereco() {
    }

    public Endereco(
            Usuario usuario,
            String cep,
            String logradouro,
            String numero,
            String complemento,
            String bairro,
            String cidade,
            String estado,
            BigDecimal latitude,
            BigDecimal longitude,
            boolean principal
    ) {
        this.usuario = usuario;
        atualizarDados(cep, logradouro, numero, complemento, bairro, cidade, estado, latitude, longitude);
        this.principal = principal;
    }

    @PrePersist
    void aoCriar() {
        criadoEm = OffsetDateTime.now();
    }

    public void atualizarDados(
            String cep,
            String logradouro,
            String numero,
            String complemento,
            String bairro,
            String cidade,
            String estado,
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        this.cep = limpar(cep);
        this.logradouro = limpar(logradouro);
        this.numero = limpar(numero);
        this.complemento = limparOpcional(complemento);
        this.bairro = limpar(bairro);
        this.cidade = limpar(cidade);
        this.estado = limpar(estado).toUpperCase();
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public void marcarComoPrincipal() {
        principal = true;
    }

    public void desmarcarComoPrincipal() {
        principal = false;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getCep() {
        return cep;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public String getEstado() {
        return estado;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public boolean isPrincipal() {
        return principal;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    private String limpar(String valor) {
        return valor.trim();
    }

    private String limparOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }
}
