import type { Summary } from '../lib/summary';
import { formatInteger, formatMs, formatPercent, formatUsd } from '../lib/format';

interface CardProps {
  label: string;
  value: string;
  hint?: string;
}

function SummaryCard({ label, value, hint }: CardProps) {
  return (
    <div className="card p-4">
      <dt className="text-sm text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</dd>}
    </div>
  );
}

export function SummaryCards({ summary }: { summary: Summary }) {
  return (
    // <dl> — список «название: значение», семантически подходит для итогов
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Итоги по выбранным запросам">
      <SummaryCard label="Запросов" value={formatInteger(summary.totalRequests)} />
      <SummaryCard
        label="Доля ошибок"
        value={formatPercent(summary.errorRatePercent)}
        hint="429 + 500"
      />
      <SummaryCard label="Средняя задержка" value={formatMs(summary.avgLatencyMs)} />
      <SummaryCard label="Стоимость" value={formatUsd(summary.totalCostUsd)} />
    </dl>
  );
}
