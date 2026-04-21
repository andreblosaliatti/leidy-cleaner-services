CREATE TABLE enderecos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    cep VARCHAR(20) NOT NULL,
    logradouro VARCHAR(180) NOT NULL,
    numero VARCHAR(30) NOT NULL,
    complemento VARCHAR(120),
    bairro VARCHAR(120) NOT NULL,
    cidade VARCHAR(120) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enderecos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE INDEX idx_enderecos_usuario_id ON enderecos (usuario_id);
CREATE INDEX idx_enderecos_usuario_principal ON enderecos (usuario_id, principal);
