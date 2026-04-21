CREATE TABLE regioes_atendimento (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_regioes_atendimento_nome UNIQUE (nome),
    CONSTRAINT ck_regioes_atendimento_tipo CHECK (tipo IN ('BAIRRO'))
);

CREATE INDEX idx_regioes_atendimento_ativo ON regioes_atendimento (ativo);

CREATE TABLE profissional_regioes (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    regiao_id BIGINT NOT NULL,
    CONSTRAINT uk_profissional_regioes_profissional_regiao UNIQUE (profissional_id, regiao_id),
    CONSTRAINT fk_profissional_regioes_profissional FOREIGN KEY (profissional_id) REFERENCES perfis_profissional (id),
    CONSTRAINT fk_profissional_regioes_regiao FOREIGN KEY (regiao_id) REFERENCES regioes_atendimento (id)
);

CREATE INDEX idx_profissional_regioes_profissional_id ON profissional_regioes (profissional_id);
CREATE INDEX idx_profissional_regioes_regiao_id ON profissional_regioes (regiao_id);

CREATE TABLE disponibilidades_profissional (
    id BIGSERIAL PRIMARY KEY,
    profissional_id BIGINT NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_disponibilidades_profissional_profissional FOREIGN KEY (profissional_id) REFERENCES perfis_profissional (id),
    CONSTRAINT ck_disponibilidades_profissional_dia CHECK (dia_semana IN ('SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO')),
    CONSTRAINT ck_disponibilidades_profissional_horario CHECK (hora_fim > hora_inicio)
);

CREATE INDEX idx_disponibilidades_profissional_profissional_id ON disponibilidades_profissional (profissional_id);
CREATE INDEX idx_disponibilidades_profissional_dia ON disponibilidades_profissional (dia_semana);

CREATE TABLE documentos_verificacao (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    tipo_documento VARCHAR(40) NOT NULL,
    numero_documento VARCHAR(80) NOT NULL,
    documento_frente_url VARCHAR(500),
    documento_verso_url VARCHAR(500),
    selfie_url VARCHAR(500),
    comprovante_residencia_url VARCHAR(500),
    status_verificacao VARCHAR(30) NOT NULL,
    observacao_analise TEXT,
    analisado_por_usuario_id BIGINT,
    analisado_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documentos_verificacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT fk_documentos_verificacao_analisado_por FOREIGN KEY (analisado_por_usuario_id) REFERENCES usuarios (id),
    CONSTRAINT ck_documentos_verificacao_status CHECK (status_verificacao IN ('PENDENTE', 'EM_ANALISE', 'APROVADO', 'REJEITADO'))
);

CREATE INDEX idx_documentos_verificacao_usuario_id ON documentos_verificacao (usuario_id);
CREATE INDEX idx_documentos_verificacao_status ON documentos_verificacao (status_verificacao);

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Centro Histórico', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Centro Histórico');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Cidade Baixa', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Cidade Baixa');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Menino Deus', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Menino Deus');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Moinhos de Vento', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Moinhos de Vento');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Petrópolis', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Petrópolis');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Bela Vista', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Bela Vista');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Tristeza', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Tristeza');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Partenon', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Partenon');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Sarandi', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Sarandi');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Restinga', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Restinga');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Cristal', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Cristal');

INSERT INTO regioes_atendimento (nome, tipo, ativo)
SELECT 'Jardim Botânico', 'BAIRRO', TRUE
WHERE NOT EXISTS (SELECT 1 FROM regioes_atendimento WHERE nome = 'Jardim Botânico');
