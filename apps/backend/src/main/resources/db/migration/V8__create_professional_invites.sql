CREATE TABLE convites_profissional (
    id BIGSERIAL PRIMARY KEY,
    solicitacao_id BIGINT NOT NULL,
    profissional_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL,
    enviado_em TIMESTAMP WITH TIME ZONE NOT NULL,
    visualizado_em TIMESTAMP WITH TIME ZONE,
    respondido_em TIMESTAMP WITH TIME ZONE,
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_convites_profissional_solicitacao FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_faxina (id),
    CONSTRAINT fk_convites_profissional_profissional FOREIGN KEY (profissional_id) REFERENCES perfis_profissional (id),
    CONSTRAINT uk_convites_profissional_solicitacao_profissional UNIQUE (solicitacao_id, profissional_id),
    CONSTRAINT ck_convites_profissional_status CHECK (status IN (
        'ENVIADO',
        'VISUALIZADO',
        'ACEITO',
        'RECUSADO',
        'EXPIRADO',
        'CANCELADO'
    )),
    CONSTRAINT ck_convites_profissional_expira_em CHECK (expira_em > enviado_em)
);

CREATE INDEX idx_convites_profissional_profissional_id ON convites_profissional (profissional_id);
CREATE INDEX idx_convites_profissional_solicitacao_id ON convites_profissional (solicitacao_id);
CREATE INDEX idx_convites_profissional_status ON convites_profissional (status);
