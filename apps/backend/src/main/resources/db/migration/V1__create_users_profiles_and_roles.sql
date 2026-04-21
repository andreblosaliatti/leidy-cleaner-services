CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome_completo VARCHAR(160) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(30) NOT NULL,
    status_conta VARCHAR(30) NOT NULL,
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    telefone_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    ultimo_login_em TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT ck_usuarios_tipo_usuario CHECK (tipo_usuario IN ('ADMIN', 'CLIENTE', 'PROFISSIONAL')),
    CONSTRAINT ck_usuarios_status_conta CHECK (status_conta IN ('ATIVA', 'INATIVA', 'BLOQUEADA', 'PENDENTE_VERIFICACAO'))
);

CREATE INDEX idx_usuarios_email ON usuarios (email);
CREATE INDEX idx_usuarios_status_conta ON usuarios (status_conta);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_roles_nome UNIQUE (nome)
);

CREATE TABLE usuario_roles (
    usuario_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, role_id),
    CONSTRAINT fk_usuario_roles_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT fk_usuario_roles_role FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE INDEX idx_usuario_roles_usuario_id ON usuario_roles (usuario_id);
CREATE INDEX idx_usuario_roles_role_id ON usuario_roles (role_id);

CREATE TABLE perfis_cliente (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    observacoes_internas TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_perfis_cliente_usuario_id UNIQUE (usuario_id),
    CONSTRAINT fk_perfis_cliente_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE INDEX idx_perfis_cliente_usuario_id ON perfis_cliente (usuario_id);

CREATE TABLE perfis_profissional (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    nome_exibicao VARCHAR(160) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    data_nascimento DATE NOT NULL,
    descricao TEXT,
    foto_perfil_url VARCHAR(500),
    experiencia_anos INTEGER NOT NULL DEFAULT 0,
    ativo_para_receber_chamados BOOLEAN NOT NULL DEFAULT FALSE,
    status_aprovacao VARCHAR(30) NOT NULL,
    nota_media NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    total_avaliacoes INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_perfis_profissional_usuario_id UNIQUE (usuario_id),
    CONSTRAINT uk_perfis_profissional_cpf UNIQUE (cpf),
    CONSTRAINT fk_perfis_profissional_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT ck_perfis_profissional_experiencia CHECK (experiencia_anos >= 0),
    CONSTRAINT ck_perfis_profissional_nota_media CHECK (nota_media >= 0.00 AND nota_media <= 5.00),
    CONSTRAINT ck_perfis_profissional_total_avaliacoes CHECK (total_avaliacoes >= 0),
    CONSTRAINT ck_perfis_profissional_status_aprovacao CHECK (status_aprovacao IN ('PENDENTE', 'EM_ANALISE', 'APROVADO', 'REJEITADO'))
);

CREATE INDEX idx_perfis_profissional_usuario_id ON perfis_profissional (usuario_id);
CREATE INDEX idx_perfis_profissional_cpf ON perfis_profissional (cpf);
CREATE INDEX idx_perfis_profissional_status_aprovacao ON perfis_profissional (status_aprovacao);
CREATE INDEX idx_perfis_profissional_ativo_chamados ON perfis_profissional (ativo_para_receber_chamados);

INSERT INTO roles (nome)
VALUES
    ('ROLE_ADMIN'),
    ('ROLE_CLIENTE'),
    ('ROLE_PROFISSIONAL');
