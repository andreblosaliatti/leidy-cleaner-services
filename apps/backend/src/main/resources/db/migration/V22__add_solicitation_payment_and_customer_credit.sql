ALTER TABLE pagamentos
    ADD COLUMN solicitacao_id BIGINT;

UPDATE pagamentos pagamento
SET solicitacao_id = atendimento.solicitacao_id
FROM atendimentos_faxina atendimento
WHERE pagamento.atendimento_id = atendimento.id
  AND pagamento.solicitacao_id IS NULL;

ALTER TABLE pagamentos
    ALTER COLUMN atendimento_id DROP NOT NULL;

ALTER TABLE pagamentos
    ADD CONSTRAINT fk_pagamentos_solicitacao
        FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_faxina (id);

ALTER TABLE pagamentos
    ADD CONSTRAINT ck_pagamentos_referencia_operacional
        CHECK (solicitacao_id IS NOT NULL OR atendimento_id IS NOT NULL);

CREATE INDEX idx_pagamentos_solicitacao_id
    ON pagamentos (solicitacao_id);

CREATE INDEX IF NOT EXISTS idx_pagamentos_atendimento_id
    ON pagamentos (atendimento_id);

CREATE TABLE creditos_cliente_movimentos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    solicitacao_origem_id BIGINT,
    pagamento_origem_id BIGINT,
    solicitacao_uso_id BIGINT,
    tipo_movimento VARCHAR(60) NOT NULL,
    valor NUMERIC(12, 2) NOT NULL,
    saldo_resultante NUMERIC(12, 2) NOT NULL,
    observacao TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_creditos_cliente_movimentos_cliente
        FOREIGN KEY (cliente_id) REFERENCES perfis_cliente (id),
    CONSTRAINT fk_creditos_cliente_movimentos_solicitacao_origem
        FOREIGN KEY (solicitacao_origem_id) REFERENCES solicitacoes_faxina (id),
    CONSTRAINT fk_creditos_cliente_movimentos_pagamento_origem
        FOREIGN KEY (pagamento_origem_id) REFERENCES pagamentos (id),
    CONSTRAINT fk_creditos_cliente_movimentos_solicitacao_uso
        FOREIGN KEY (solicitacao_uso_id) REFERENCES solicitacoes_faxina (id),
    CONSTRAINT ck_creditos_cliente_movimentos_tipo CHECK (
        tipo_movimento IN (
            'CREDITO_GERADO_SEM_ACEITE',
            'CREDITO_UTILIZADO_EM_SOLICITACAO',
            'CREDITO_ESTORNADO',
            'AJUSTE_ADMIN'
        )
    )
);

CREATE INDEX idx_creditos_cliente_movimentos_cliente_id
    ON creditos_cliente_movimentos (cliente_id);

CREATE INDEX idx_creditos_cliente_movimentos_solicitacao_origem_id
    ON creditos_cliente_movimentos (solicitacao_origem_id);

CREATE INDEX idx_creditos_cliente_movimentos_pagamento_origem_id
    ON creditos_cliente_movimentos (pagamento_origem_id);

CREATE INDEX idx_creditos_cliente_movimentos_solicitacao_uso_id
    ON creditos_cliente_movimentos (solicitacao_uso_id);

CREATE UNIQUE INDEX uk_creditos_cliente_movimentos_pagamento_tipo
    ON creditos_cliente_movimentos (pagamento_origem_id, tipo_movimento);
