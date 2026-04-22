CREATE TABLE atendimentos_faxina (
    id BIGSERIAL PRIMARY KEY,
    solicitacao_id BIGINT NOT NULL,
    cliente_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    status VARCHAR(40) NOT NULL,
    valor_servico NUMERIC(10, 2) NOT NULL,
    percentual_comissao_agencia NUMERIC(5, 2) NOT NULL,
    valor_estimado_profissional NUMERIC(10, 2) NOT NULL,
    inicio_previsto_em TIMESTAMP WITH TIME ZONE NOT NULL,
    inicio_real_em TIMESTAMP WITH TIME ZONE,
    fim_real_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_atendimentos_faxina_solicitacao UNIQUE (solicitacao_id),
    CONSTRAINT fk_atendimentos_faxina_solicitacao
        FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_faxina (id),
    CONSTRAINT fk_atendimentos_faxina_cliente
        FOREIGN KEY (cliente_id) REFERENCES perfis_cliente (id),
    CONSTRAINT fk_atendimentos_faxina_profissional
        FOREIGN KEY (profissional_id) REFERENCES perfis_profissional (id),
    CONSTRAINT ck_atendimentos_faxina_status CHECK (
        status IN (
            'AGUARDANDO_PAGAMENTO',
            'CONFIRMADO',
            'EM_EXECUCAO',
            'FINALIZADO',
            'CANCELADO',
            'EM_ANALISE'
        )
    )
);

CREATE INDEX idx_atendimentos_faxina_cliente
    ON atendimentos_faxina (cliente_id);

CREATE INDEX idx_atendimentos_faxina_profissional
    ON atendimentos_faxina (profissional_id);

CREATE INDEX idx_atendimentos_faxina_status
    ON atendimentos_faxina (status);
