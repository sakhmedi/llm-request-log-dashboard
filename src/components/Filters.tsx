import { useId } from 'react';
import { MODELS, STATUSES, type Filters as FiltersState } from '../types';
import { hasActiveFilters, isValidIsoDay } from '../lib/filters';

interface FiltersProps {
  filters: FiltersState;
  onChange: (patch: Partial<FiltersState>) => void;
  onReset: () => void;
}

const STATUS_LABELS: Record<(typeof STATUSES)[number], string> = {
  200: '200 OK',
  429: '429 Лимит',
  500: '500 Ошибка',
};

/**
 * Добавляет значение в список или убирает его. Порядок берём из `all`,
 * чтобы в URL всегда было model=a,b, а не то b,a, то a,b.
 */
function toggleValue<T>(selected: readonly T[], value: T, all: readonly T[]): T[] {
  const has = selected.includes(value);
  return all.filter((item) => (item === value ? !has : selected.includes(item)));
}

/** Чекбокс в виде «таблетки». Нативный input внутри — значит, работает клавиатура и скринридер. */
function Chip({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm select-none hover:bg-slate-50 has-checked:border-indigo-500 has-checked:bg-indigo-50 has-checked:text-indigo-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:has-checked:border-indigo-400 dark:has-checked:bg-indigo-500/15 dark:has-checked:text-indigo-100">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-indigo-600 dark:accent-indigo-400"
      />
      {label}
    </label>
  );
}

export function Filters({ filters, onChange, onReset }: FiltersProps) {
  const fromId = useId();
  const toId = useId();

  // Пустое поле даты → null; неполную/битую дату тоже не пишем в URL.
  const dateValue = (raw: string): string | null => (raw && isValidIsoDay(raw) ? raw : null);

  return (
    <section aria-label="Фильтры" className="card p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <fieldset>
            <legend className="label">Модель</legend>
            <div className="flex flex-wrap gap-2">
              {MODELS.map((model) => (
                <Chip
                  key={model}
                  label={model}
                  checked={filters.models.includes(model)}
                  onChange={() => onChange({ models: toggleValue(filters.models, model, MODELS) })}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">Статус</legend>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <Chip
                  key={status}
                  label={STATUS_LABELS[status]}
                  checked={filters.statuses.includes(status)}
                  onChange={() =>
                    onChange({ statuses: toggleValue(filters.statuses, status, STATUSES) })
                  }
                />
              ))}
            </div>
          </fieldset>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor={fromId} className="label">
              С (UTC)
            </label>
            <input
              id={fromId}
              type="date"
              className="field"
              value={filters.from ?? ''}
              max={filters.to ?? undefined}
              onChange={(e) => onChange({ from: dateValue(e.target.value) })}
            />
          </div>
          <div>
            <label htmlFor={toId} className="label">
              По (UTC)
            </label>
            <input
              id={toId}
              type="date"
              className="field"
              value={filters.to ?? ''}
              min={filters.from ?? undefined}
              onChange={(e) => onChange({ to: dateValue(e.target.value) })}
            />
          </div>
          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters(filters)}
            className="btn-secondary col-span-2 sm:col-span-1"
          >
            Сбросить
          </button>
        </div>
      </div>
    </section>
  );
}
