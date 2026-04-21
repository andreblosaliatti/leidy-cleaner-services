package br.com.leidycleaner.profissionais.entity;

import br.com.leidycleaner.regioes.entity.RegiaoAtendimento;
import jakarta.persistence.Entity;
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
        name = "profissional_regioes",
        uniqueConstraints = @UniqueConstraint(name = "uk_profissional_regioes_profissional_regiao", columnNames = {"profissional_id", "regiao_id"})
)
public class ProfissionalRegiao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "profissional_id", nullable = false)
    private PerfilProfissional profissional;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "regiao_id", nullable = false)
    private RegiaoAtendimento regiao;

    protected ProfissionalRegiao() {
    }

    public ProfissionalRegiao(PerfilProfissional profissional, RegiaoAtendimento regiao) {
        this.profissional = profissional;
        this.regiao = regiao;
    }

    public Long getId() {
        return id;
    }

    public PerfilProfissional getProfissional() {
        return profissional;
    }

    public RegiaoAtendimento getRegiao() {
        return regiao;
    }
}
