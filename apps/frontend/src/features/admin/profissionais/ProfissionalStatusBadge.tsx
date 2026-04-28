import { getStatusAprovacaoProfissionalInfo } from './profissionalLabels';
import type { StatusAprovacaoProfissional } from './types';

export function ProfissionalStatusBadge({ status }: { status: StatusAprovacaoProfissional }) {
  const statusInfo = getStatusAprovacaoProfissionalInfo(status);

  return (
    <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}
