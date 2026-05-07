export type NotificationBadgeTone = 'red' | 'yellow' | 'green' | 'neutral';

type NotificationBadgeProps = {
  count: number;
  tone?: NotificationBadgeTone;
  label?: string;
};

const toneClassName: Record<NotificationBadgeTone, string> = {
  red: 'bg-red-600 text-white',
  yellow: 'bg-amber-100 text-amber-900',
  green: 'bg-green-100 text-green-800',
  neutral: 'bg-slate-100 text-slate-700',
};

export function NotificationBadge({ count, label, tone = 'neutral' }: NotificationBadgeProps) {
  if (count <= 0) {
    return null;
  }

  const text = count > 99 ? '99+' : String(count);

  return (
    <span
      aria-label={label ?? `${count} notificações`}
      className={`inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-black leading-none ${toneClassName[tone]}`}
    >
      {text}
    </span>
  );
}
