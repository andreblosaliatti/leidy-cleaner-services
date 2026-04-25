CREATE TABLE ocorrencias_atendimento (
    id BIGSERIAL PRIMARY KEY,
    atendimento_id BIGINT NOT NULL,
    aberto_por_usuario_id BIGINT NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    resolvido_em TIMESTAMP WITH TIME ZONE,
    resolvido_por_usuario_id BIGINT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ocorrencias_atendimento_atendimento
        FOREIGN KEY (atendimento_id) REFERENCES atendimentos_faxina (id),
    CONSTRAINT fk_ocorrencias_atendimento_aberto_por
        FOREIGN KEY (aberto_por_usuario_id) REFERENCES usuarios (id),
    CONSTRAINT fk_ocorrencias_atendimento_resolvido_por
        FOREIGN KEY (resolvido_por_usuario_id) REFERENCES usuarios (id),
    CONSTRAINT ck_ocorrencias_atendimento_tipo CHECK (
        tipo IN (
            'ATRASO',
            'AUSENCIA',
            'CONDUTA',
            'QUALIDADE_SERVICO',
            'PAGAMENTO',
            'OUTRO'
        )
    ),
    CONSTRAINT ck_ocorrencias_atendimento_status CHECK (
        status IN (
            'ABERTA',
            'EM_ANALISE',
            'RESOLVIDA',
            'CANCELADA'
        )
    )
);

CREATE INDEX idx_ocorrencias_atendimento_atendimento
    ON ocorrencias_atendimento (atendimento_id);

CREATE INDEX idx_ocorrencias_atendimento_aberto_por
    ON ocorrencias_atendimento (aberto_por_usuario_id);

CREATE INDEX idx_ocorrencias_atendimento_status
    ON ocorrencias_atendimento (status);

CREATE INDEX idx_ocorrencias_atendimento_criado_em
    ON ocorrencias_atendimento (criado_em);
