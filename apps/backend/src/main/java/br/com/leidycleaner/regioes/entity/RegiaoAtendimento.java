package br.com.leidycleaner.regioes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "regioes_atendimento")
public class RegiaoAtendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, unique = true, length = 120)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoRegiaoAtendimento tipo;

    @Column(name = "ativo", nullable = false)
    private boolean ativo;

    protected RegiaoAtendimento() {
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public TipoRegiaoAtendimento getTipo() {
        return tipo;
    }

    public boolean isAtivo() {
        return ativo;
    }
}
