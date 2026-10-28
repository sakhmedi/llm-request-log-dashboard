import { formatInteger } from '../lib/format';

interface PaginationProps {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  totalItems,
  onPageChange,
}: PaginationProps) {
  return (
    <nav
      aria-label="Страницы журнала"
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
        Показано{' '}
        <span className="font-medium text-slate-900 tabular-nums dark:text-slate-100">
          {formatInteger(rangeStart)}–{formatInteger(rangeEnd)}
        </span>{' '}
        из{' '}
        <span className="font-medium text-slate-900 tabular-nums dark:text-slate-100">
          {formatInteger(totalItems)}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <span aria-hidden="true">←</span> Назад
        </button>
        <span className="min-w-28 text-center text-sm tabular-nums">
          Стр. {page} из {totalPages}
        </span>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Вперёд <span aria-hidden="true">→</span>
        </button>
      </div>
    </nav>
  );
}
