import { getStatusConviteInfo } from './conviteLabels';
import type { StatusConvite } from './types';

export function ConviteStatusBadge({ status }: { status: StatusConvite }) {
  const statusInfo = getStatusConviteInfo(status);

  return (
    <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}
