interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  /** Идёт повторная загрузка — блокируем кнопку, чтобы не нажимали дважды. */
  isRetrying?: boolean;
}

export function ErrorState({ message, onRetry, isRetrying = false }: ErrorStateProps) {
  return (
    // role="alert" — скринридер сразу зачитает сообщение
    <div
      role="alert"
      className="card flex flex-col items-center border-red-200 px-6 py-12 text-center dark:border-red-900/60"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-10 text-red-500 dark:text-red-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path strokeLinecap="round" d="M12 8v5m0 3.5v.01" />
        <path
          strokeLinejoin="round"
          d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
        />
      </svg>
      <h2 className="mt-4 text-base font-semibold">Не удалось загрузить журнал запросов</h2>
      <p className="mt-1 max-w-md text-sm break-words text-slate-600 dark:text-slate-400">
        {message}
      </p>
      <button type="button" onClick={onRetry} disabled={isRetrying} className="btn-primary mt-5">
        {isRetrying ? 'Загрузка…' : 'Повторить'}
      </button>
    </div>
  );
}
