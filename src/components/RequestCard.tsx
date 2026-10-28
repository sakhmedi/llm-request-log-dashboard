import type { LlmRequest } from '../types';
import { formatDateTime, formatInteger, formatMs, formatUsdPrecise } from '../lib/format';
import { StatusBadge } from './StatusBadge';

/** Одна запись журнала в виде карточки — для узких экранов вместо строки таблицы. */
export function RequestCard({ request }: { request: LlmRequest }) {
  return (
    <article className="card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-medium">{request.model}</span>
        <StatusBadge status={request.status} />
      </div>
      <time
        dateTime={request.timestamp}
        className="mt-1 block text-xs text-slate-600 tabular-nums dark:text-slate-400"
      >
        {formatDateTime(request.timestamp)} UTC
      </time>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-slate-600 dark:text-slate-400">Токены in/out</dt>
          <dd className="tabular-nums">
            {formatInteger(request.inputTokens)} / {formatInteger(request.outputTokens)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600 dark:text-slate-400">Задержка</dt>
          <dd className="tabular-nums">{formatMs(request.latencyMs)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600 dark:text-slate-400">Стоимость</dt>
          <dd className="tabular-nums">{formatUsdPrecise(request.costUsd)}</dd>
        </div>
      </dl>
    </article>
  );
}
