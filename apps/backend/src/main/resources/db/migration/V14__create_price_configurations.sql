CREATE TABLE configuracoes_preco (
    id BIGSERIAL PRIMARY KEY,
    valor_hora NUMERIC(10, 2) NOT NULL,
    percentual_comissao_agencia NUMERIC(5, 2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_configuracoes_preco_valor_hora CHECK (valor_hora > 0),
    CONSTRAINT ck_configuracoes_preco_percentual_comissao CHECK (
        percentual_comissao_agencia >= 0
        AND percentual_comissao_agencia <= 100
    )
);

CREATE INDEX idx_configuracoes_preco_ativo ON configuracoes_preco (ativo);

INSERT INTO configuracoes_preco (
    valor_hora,
    percentual_comissao_agencia,
    ativo,
    criado_em,
    atualizado_em
)
SELECT
    45.00,
    20.00,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1
    FROM configuracoes_preco
    WHERE ativo = TRUE
);
