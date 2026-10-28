interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-10 text-slate-400 dark:text-slate-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18l-7 8v6l-4-2v-4L3 5z" />
      </svg>
      <h2 className="mt-4 text-base font-semibold">Нет запросов по выбранным фильтрам</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        Попробуйте выбрать другие модели, статусы или расширить диапазон дат.
      </p>
      <button type="button" onClick={onReset} className="btn-primary mt-5">
        Сбросить фильтры
      </button>
    </div>
  );
}
