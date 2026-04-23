CREATE TABLE pagamentos (
    id BIGSERIAL PRIMARY KEY,
    atendimento_id BIGINT NOT NULL,
    gateway VARCHAR(30) NOT NULL,
    gateway_payment_id VARCHAR(120) NOT NULL,
    metodo_pagamento VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    valor_bruto NUMERIC(10, 2) NOT NULL,
    valor_taxa_gateway NUMERIC(10, 2),
    valor_liquido_recebido NUMERIC(10, 2),
    recebido_em TIMESTAMP WITH TIME ZONE,
    url_pagamento VARCHAR(500),
    pix_copia_e_cola TEXT,
    payload_resumo TEXT,
    webhook_processado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_pagamentos_atendimento UNIQUE (atendimento_id),
    CONSTRAINT uk_pagamentos_gateway_payment_id UNIQUE (gateway_payment_id),
    CONSTRAINT fk_pagamentos_atendimento
        FOREIGN KEY (atendimento_id) REFERENCES atendimentos_faxina (id),
    CONSTRAINT ck_pagamentos_gateway CHECK (gateway IN ('ASAAS')),
    CONSTRAINT ck_pagamentos_metodo CHECK (
        metodo_pagamento IN ('PIX', 'BOLETO', 'CARTAO_CREDITO')
    ),
    CONSTRAINT ck_pagamentos_status CHECK (
        status IN (
            'PENDENTE',
            'AGUARDANDO_CONFIRMACAO',
            'PAGO',
            'FALHOU',
            'CANCELADO',
            'ESTORNADO'
        )
    )
);

CREATE INDEX idx_pagamentos_status
    ON pagamentos (status);

CREATE INDEX idx_pagamentos_webhook_processado
    ON pagamentos (webhook_processado);
