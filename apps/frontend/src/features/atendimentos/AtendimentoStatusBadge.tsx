import { getStatusAtendimentoInfo } from './atendimentoLabels';
import type { StatusAtendimento } from './types';

export function AtendimentoStatusBadge({ status }: { status: StatusAtendimento }) {
  const statusInfo = getStatusAtendimentoInfo(status);

  return (
    <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}
