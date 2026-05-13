package br.com.leidycleaner.solicitacoes.entity;

public enum StatusSolicitacao {
    CRIADA,
    AGUARDANDO_SELECAO,
    AGUARDANDO_PAGAMENTO,
    PAGA_AGUARDANDO_ACEITE,
    NAO_ACEITA_CREDITO_GERADO,
    CONVITES_ENVIADOS,
    AGUARDANDO_ACEITE,
    ACEITA,
    PAGA,
    EM_EXECUCAO,
    FINALIZADA,
    CANCELADA,
    EXPIRADA
}
