ALTER TABLE pagamentos
    DROP CONSTRAINT ck_pagamentos_gateway;

ALTER TABLE pagamentos
    ADD CONSTRAINT ck_pagamentos_gateway CHECK (
        gateway IN ('ASAAS', 'INTERNO')
    );

ALTER TABLE pagamentos
    DROP CONSTRAINT ck_pagamentos_metodo;

ALTER TABLE pagamentos
    ADD CONSTRAINT ck_pagamentos_metodo CHECK (
        metodo_pagamento IN ('PIX', 'BOLETO', 'CARTAO_CREDITO', 'CREDITO_SOLICITACAO')
    );
