import { useId } from 'react';
import { SORT_FIELDS, type LlmRequest, type SortField, type SortState } from '../types';
import { nextSort } from '../lib/sorting';
import { parseSort } from '../lib/urlState';
import { formatDateTime, formatInteger, formatMs, formatUsdPrecise } from '../lib/format';
import { StatusBadge } from './StatusBadge';
import { RequestCard } from './RequestCard';

interface RequestsTableProps {
  rows: readonly LlmRequest[];
  sort: SortState;
  onSortChange: (sort: SortState) => void;
}

const SORT_LABELS: Record<SortField, string> = {
  timestamp: 'Время',
  latencyMs: 'Задержка',
  costUsd: 'Стоимость',
};

/** Заголовок колонки с сортировкой: кнопка внутри <th> + aria-sort для скринридеров. */
function SortableHeader({
  field,
  sort,
  onSortChange,
  align = 'left',
}: {
  field: SortField;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  align?: 'left' | 'right';
}) {
  const isActive = sort.field === field;
  const ariaSort = isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
  const arrow = isActive ? (sort.direction === 'asc' ? '↑' : '↓') : '↕';

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-3 py-2 ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <button
        type="button"
        onClick={() => onSortChange(nextSort(sort, field))}
        className={`inline-flex items-center gap-1 rounded font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        {SORT_LABELS[field]}
        <span aria-hidden="true" className={isActive ? '' : 'text-slate-400 dark:text-slate-500'}>
          {arrow}
        </span>
      </button>
    </th>
  );
}

export function RequestsTable({ rows, sort, onSortChange }: RequestsTableProps) {
  const sortSelectId = useId();
  const headerProps = { sort, onSortChange };

  return (
    <section aria-label="Журнал запросов">
      {/* ≥ 768 px: обычная таблица */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Журнал запросов к моделям, сортировка: {SORT_LABELS[sort.field]},{' '}
            {sort.direction === 'asc' ? 'по возрастанию' : 'по убыванию'}
          </caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
            <tr>
              <SortableHeader field="timestamp" {...headerProps} />
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Модель
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                Статус
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                Токены in / out
              </th>
              <SortableHeader field="latencyMs" align="right" {...headerProps} />
              <SortableHeader field="costUsd" align="right" {...headerProps} />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((request) => (
              <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                  <time dateTime={request.timestamp}>{formatDateTime(request.timestamp)}</time>
                </td>
                <td className="px-3 py-2 font-mono whitespace-nowrap">{request.model}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
                  {formatInteger(request.inputTokens)} / {formatInteger(request.outputTokens)}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
                  {formatMs(request.latencyMs)}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
                  {formatUsdPrecise(request.costUsd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* < 768 px: карточки. Заголовков таблицы нет, поэтому сортировка — через select. */}
      <div className="space-y-3 md:hidden">
        <div className="flex items-center gap-2">
          <label
            htmlFor={sortSelectId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Сортировка
          </label>
          <select
            id={sortSelectId}
            className="field w-auto min-w-0 flex-1"
            value={`${sort.field}:${sort.direction}`}
            onChange={(e) => onSortChange(parseSort(e.target.value))}
          >
            {SORT_FIELDS.map((field) => (
              <optgroup key={field} label={SORT_LABELS[field]}>
                <option value={`${field}:desc`}>{SORT_LABELS[field]} ↓ (по убыванию)</option>
                <option value={`${field}:asc`}>{SORT_LABELS[field]} ↑ (по возрастанию)</option>
              </optgroup>
            ))}
          </select>
        </div>
        <ul className="space-y-3">
          {rows.map((request) => (
            <li key={request.id}>
              <RequestCard request={request} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
