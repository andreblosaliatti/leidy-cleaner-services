CREATE TABLE dispositivos_push (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    plataforma VARCHAR(30) NOT NULL,
    token VARCHAR(2048) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_uso_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispositivos_push_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT ck_dispositivos_push_plataforma CHECK (plataforma IN ('ANDROID')),
    CONSTRAINT uk_dispositivos_push_usuario_plataforma_token UNIQUE (usuario_id, plataforma, token)
);

CREATE INDEX idx_dispositivos_push_usuario_id ON dispositivos_push (usuario_id);
CREATE INDEX idx_dispositivos_push_ativo ON dispositivos_push (ativo);
CREATE INDEX idx_dispositivos_push_plataforma ON dispositivos_push (plataforma);
