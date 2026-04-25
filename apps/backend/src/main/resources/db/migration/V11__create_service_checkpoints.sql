CREATE TABLE checkpoints_servico (
    id BIGSERIAL PRIMARY KEY,
    atendimento_id BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    registrado_por_usuario_id BIGINT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    foto_comprovacao_url VARCHAR(500),
    observacao TEXT,
    registrado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_checkpoints_servico_atendimento
        FOREIGN KEY (atendimento_id) REFERENCES atendimentos_faxina (id),
    CONSTRAINT fk_checkpoints_servico_usuario
        FOREIGN KEY (registrado_por_usuario_id) REFERENCES usuarios (id),
    CONSTRAINT ck_checkpoints_servico_tipo CHECK (tipo IN ('INICIO', 'FIM')),
    CONSTRAINT uk_checkpoints_servico_atendimento_tipo UNIQUE (atendimento_id, tipo)
);

CREATE INDEX idx_checkpoints_servico_atendimento
    ON checkpoints_servico (atendimento_id);

CREATE INDEX idx_checkpoints_servico_usuario
    ON checkpoints_servico (registrado_por_usuario_id);

CREATE INDEX idx_checkpoints_servico_tipo
    ON checkpoints_servico (tipo);
