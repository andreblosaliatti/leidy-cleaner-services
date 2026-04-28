import { getStatusVerificacaoInfo } from './verificacaoLabels';
import type { StatusVerificacao } from './types';

export function VerificacaoStatusBadge({ status }: { status: StatusVerificacao }) {
  const statusInfo = getStatusVerificacaoInfo(status);

  return (
    <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}
