CREATE TABLE solicitacoes_faxina (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    endereco_id BIGINT NOT NULL,
    regiao_id BIGINT NOT NULL,
    data_hora_desejada TIMESTAMP WITH TIME ZONE NOT NULL,
    duracao_estimada_horas INTEGER NOT NULL,
    tipo_servico VARCHAR(40) NOT NULL,
    observacoes TEXT,
    valor_servico NUMERIC(10, 2) NOT NULL,
    percentual_comissao_agencia NUMERIC(5, 2) NOT NULL,
    valor_estimado_profissional NUMERIC(10, 2) NOT NULL,
    status VARCHAR(40) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_solicitacoes_faxina_cliente FOREIGN KEY (cliente_id) REFERENCES perfis_cliente (id),
    CONSTRAINT fk_solicitacoes_faxina_endereco FOREIGN KEY (endereco_id) REFERENCES enderecos (id),
    CONSTRAINT fk_solicitacoes_faxina_regiao FOREIGN KEY (regiao_id) REFERENCES regioes_atendimento (id),
    CONSTRAINT ck_solicitacoes_faxina_tipo_servico CHECK (tipo_servico IN ('FAXINA_RESIDENCIAL')),
    CONSTRAINT ck_solicitacoes_faxina_status CHECK (status IN (
        'CRIADA',
        'AGUARDANDO_SELECAO',
        'CONVITES_ENVIADOS',
        'AGUARDANDO_ACEITE',
        'ACEITA',
        'PAGA',
        'EM_EXECUCAO',
        'FINALIZADA',
        'CANCELADA',
        'EXPIRADA'
    )),
    CONSTRAINT ck_solicitacoes_faxina_duracao CHECK (duracao_estimada_horas > 0),
    CONSTRAINT ck_solicitacoes_faxina_valor_servico CHECK (valor_servico >= 0),
    CONSTRAINT ck_solicitacoes_faxina_percentual CHECK (percentual_comissao_agencia >= 0),
    CONSTRAINT ck_solicitacoes_faxina_valor_profissional CHECK (valor_estimado_profissional >= 0)
);

CREATE INDEX idx_solicitacoes_faxina_cliente_id ON solicitacoes_faxina (cliente_id);
CREATE INDEX idx_solicitacoes_faxina_endereco_id ON solicitacoes_faxina (endereco_id);
CREATE INDEX idx_solicitacoes_faxina_regiao_id ON solicitacoes_faxina (regiao_id);
CREATE INDEX idx_solicitacoes_faxina_status ON solicitacoes_faxina (status);
