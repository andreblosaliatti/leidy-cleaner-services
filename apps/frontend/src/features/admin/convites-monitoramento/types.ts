import type { StatusSolicitacao, TipoServico } from '../../cliente/solicitacoes/types';
import type { StatusConvite } from '../../profissional/convites/types';
import type { StatusPagamento } from '../pagamentos/types';

export type ConviteMonitoramentoAdmin = {
  conviteId: number;
  statusConvite: StatusConvite;
  solicitacaoId: number;
  solicitacaoStatus: StatusSolicitacao;
  clienteId: number;
  clienteNome: string | null;
  profissionalId: number;
  profissionalNome: string | null;
  dataHoraDesejada: string;
  tipoServico: TipoServico;
  duracaoEstimadaHoras: number;
  regiaoNome: string | null;
  enviadoEm: string;
  respondidoEm: string | null;
  expiraEm: string;
  expirado: boolean;
  pagamentoId: number | null;
  pagamentoStatus: StatusPagamento | null;
  creditoSolicitacaoId: number | null;
};
