import type { StatusCreditoSolicitacao } from '../../cliente/creditos/types';
import { getStatusCreditoSolicitacaoAdminInfo } from './creditoSolicitacaoAdminLabels';

export function CreditoSolicitacaoAdminStatusBadge({ status }: { status: StatusCreditoSolicitacao }) {
  const statusInfo = getStatusCreditoSolicitacaoAdminInfo(status);

  return (
    <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}
