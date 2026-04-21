CREATE TABLE solicitacao_profissionais_selecionados (
    id BIGSERIAL PRIMARY KEY,
    solicitacao_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    ordem_escolha INTEGER NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_solicitacao_profissionais_selecionados_solicitacao FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_faxina (id),
    CONSTRAINT fk_solicitacao_profissionais_selecionados_profissional FOREIGN KEY (profissional_id) REFERENCES perfis_profissional (id),
    CONSTRAINT uk_solicitacao_profissionais_selecionados_profissional UNIQUE (solicitacao_id, profissional_id),
    CONSTRAINT uk_solicitacao_profissionais_selecionados_ordem UNIQUE (solicitacao_id, ordem_escolha),
    CONSTRAINT ck_solicitacao_profissionais_selecionados_ordem CHECK (ordem_escolha BETWEEN 1 AND 3)
);

CREATE INDEX idx_solicitacao_profissionais_selecionados_solicitacao_id ON solicitacao_profissionais_selecionados (solicitacao_id);
CREATE INDEX idx_solicitacao_profissionais_selecionados_profissional_id ON solicitacao_profissionais_selecionados (profissional_id);
