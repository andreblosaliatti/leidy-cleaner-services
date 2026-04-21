ALTER TABLE solicitacoes_faxina
    DROP CONSTRAINT ck_solicitacoes_faxina_tipo_servico;

ALTER TABLE solicitacoes_faxina
    ADD CONSTRAINT ck_solicitacoes_faxina_tipo_servico CHECK (tipo_servico IN (
        'FAXINA_RESIDENCIAL',
        'FAXINA_COMERCIAL',
        'FAXINA_CONDOMINIO',
        'FAXINA_EVENTO'
    ));
