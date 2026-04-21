package br.com.leidycleaner.auth.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "nome", nullable = false, unique = true, length = 60)
    private RoleName nome;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected Role() {
    }

    public Role(RoleName nome) {
        this.nome = nome;
    }

    public Long getId() {
        return id;
    }

    public RoleName getNome() {
        return nome;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }
}
