export type PricingConfiguration = {
  id: number | null;
  valorHora: number;
  percentualComissaoAgencia: number;
  percentualEstimadoProfissional: number;
  ativo: boolean;
  atualizadoEm?: string | null;
};

export type PricingConfigurationUpdatePayload = {
  valorHora: number;
  percentualComissaoAgencia: number;
};
