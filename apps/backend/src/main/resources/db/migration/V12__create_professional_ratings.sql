CREATE TABLE avaliacoes_profissional (
    id BIGSERIAL PRIMARY KEY,
    atendimento_id BIGINT NOT NULL,
    cliente_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    nota INTEGER NOT NULL,
    comentario TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_avaliacoes_profissional_atendimento UNIQUE (atendimento_id),
    CONSTRAINT fk_avaliacoes_profissional_atendimento
        FOREIGN KEY (atendimento_id) REFERENCES atendimentos_faxina (id),
    CONSTRAINT fk_avaliacoes_profissional_cliente
        FOREIGN KEY (cliente_id) REFERENCES perfis_cliente (id),
    CONSTRAINT fk_avaliacoes_profissional_profissional
        FOREIGN KEY (profissional_id) REFERENCES perfis_profissional (id),
    CONSTRAINT ck_avaliacoes_profissional_nota CHECK (nota BETWEEN 1 AND 5)
);

CREATE INDEX idx_avaliacoes_profissional_cliente
    ON avaliacoes_profissional (cliente_id);

CREATE INDEX idx_avaliacoes_profissional_profissional
    ON avaliacoes_profissional (profissional_id);

CREATE INDEX idx_avaliacoes_profissional_criado_em
    ON avaliacoes_profissional (criado_em);
