import { getStatusSolicitacaoInfo } from '../../cliente/solicitacoes/solicitacaoLabels';
import type { StatusSolicitacao } from '../../cliente/solicitacoes/types';

export function SolicitacaoAdminStatusBadge({ status }: { status: StatusSolicitacao }) {
  const statusInfo = getStatusSolicitacaoInfo(status);

  return (
    <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}
