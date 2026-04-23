package br.com.leidycleaner.pagamentos.entity;

public enum StatusPagamento {
    PENDENTE,
    AGUARDANDO_CONFIRMACAO,
    PAGO,
    FALHOU,
    CANCELADO,
    ESTORNADO
}
