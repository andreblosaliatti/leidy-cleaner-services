import { apiRequest } from '../../../services/apiClient';
import type { StatusConvite } from '../../profissional/convites/types';
import type { ConviteMonitoramentoAdmin } from './types';

export type ListarConvitesMonitoramentoAdminParams = {
  status?: StatusConvite;
  solicitacaoId?: number;
  profissionalId?: number;
  clienteId?: number;
  expiraAntesDe?: string;
  expiraDepoisDe?: string;
  somenteVencidos?: boolean;
};

export function listarConvitesMonitoramentoAdmin(token: string, params: ListarConvitesMonitoramentoAdminParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set('status', params.status);
  }
  if (params.solicitacaoId) {
    searchParams.set('solicitacaoId', String(params.solicitacaoId));
  }
  if (params.profissionalId) {
    searchParams.set('profissionalId', String(params.profissionalId));
  }
  if (params.clienteId) {
    searchParams.set('clienteId', String(params.clienteId));
  }
  if (params.expiraAntesDe) {
    searchParams.set('expiraAntesDe', params.expiraAntesDe);
  }
  if (params.expiraDepoisDe) {
    searchParams.set('expiraDepoisDe', params.expiraDepoisDe);
  }
  if (params.somenteVencidos) {
    searchParams.set('somenteVencidos', 'true');
  }

  const queryString = searchParams.toString();

  return apiRequest<ConviteMonitoramentoAdmin[]>(
    `/admin/convites/monitoramento${queryString ? `?${queryString}` : ''}`,
    {
      method: 'GET',
      token,
    },
  );
}
