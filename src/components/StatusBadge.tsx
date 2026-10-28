import type { RequestStatus } from '../types';

// Для каждого статуса — цвет и подпись. Цвет никогда не единственный носитель смысла:
// рядом всегда есть код и текст.
const STATUS_STYLES: Record<RequestStatus, { label: string; className: string }> = {
  200: {
    label: 'OK',
    className:
      'bg-emerald-50 text-emerald-800 ring-emerald-600/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30',
  },
  429: {
    label: 'Лимит',
    className:
      'bg-amber-50 text-amber-800 ring-amber-600/30 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30',
  },
  500: {
    label: 'Ошибка',
    className:
      'bg-red-50 text-red-800 ring-red-600/30 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/30',
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${className}`}
    >
      <span className="tabular-nums">{status}</span>
      <span>{label}</span>
    </span>
  );
}
