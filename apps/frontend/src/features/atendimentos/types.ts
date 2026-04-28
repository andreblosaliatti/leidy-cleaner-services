export type StatusAtendimento =
  | 'AGUARDANDO_PAGAMENTO'
  | 'CONFIRMADO'
  | 'EM_EXECUCAO'
  | 'FINALIZADO'
  | 'CANCELADO'
  | 'EM_ANALISE';

export type TipoServicoAtendimento =
  | 'FAXINA_RESIDENCIAL'
  | 'FAXINA_COMERCIAL'
  | 'FAXINA_CONDOMINIO'
  | 'FAXINA_EVENTO';

export type TipoCheckpointServico = 'INICIO' | 'FIM';

export type AtendimentoFaxina = {
  id: number;
  solicitacaoId: number;
  clienteId: number;
  profissionalId: number;
  status: StatusAtendimento;
  tipoServico: TipoServicoAtendimento;
  valorServico: number;
  percentualComissaoAgencia: number;
  valorEstimadoProfissional: number;
  inicioPrevistoEm: string;
  inicioRealEm: string | null;
  fimRealEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type CheckpointServico = {
  id: number;
  atendimentoId: number;
  tipo: TipoCheckpointServico;
  registradoPorUsuarioId: number;
  latitude: number | null;
  longitude: number | null;
  fotoComprovacaoUrl: string | null;
  observacao: string | null;
  registradoEm: string;
};

export type CheckpointServicoRequest = {
  latitude?: number | null;
  longitude?: number | null;
  fotoComprovacaoUrl?: string | null;
  observacao?: string | null;
};

export type AtendimentosProfile = 'CLIENTE' | 'PROFISSIONAL';
