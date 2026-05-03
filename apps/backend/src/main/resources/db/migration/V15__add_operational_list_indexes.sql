CREATE INDEX IF NOT EXISTS idx_solicitacoes_faxina_cliente_criado_id
    ON solicitacoes_faxina (cliente_id, criado_em DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_faxina_status_criado_id
    ON solicitacoes_faxina (status, criado_em DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_atendimentos_faxina_cliente_inicio_id
    ON atendimentos_faxina (cliente_id, inicio_previsto_em DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_atendimentos_faxina_profissional_inicio_id
    ON atendimentos_faxina (profissional_id, inicio_previsto_em DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_convites_profissional_profissional_enviado_id
    ON convites_profissional (profissional_id, enviado_em DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_documentos_verificacao_usuario_efetiva_id
    ON documentos_verificacao (usuario_id, analisado_em DESC, criado_em DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_ocorrencias_atendimento_aberto_criado_id
    ON ocorrencias_atendimento (aberto_por_usuario_id, criado_em DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_pagamentos_gateway_payment_id
    ON pagamentos (gateway_payment_id);
