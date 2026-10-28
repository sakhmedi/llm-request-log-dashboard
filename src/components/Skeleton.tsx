/** Серый «пульсирующий» прямоугольник-заглушка. Размер задаётся через className. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}

/** Заглушка всей области данных, пока идёт загрузка. */
export function DashboardSkeleton() {
  return (
    // role="status" + текст для скринридеров: «идёт загрузка»
    <div role="status" className="space-y-6">
      <span className="sr-only">Загрузка данных…</span>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-20" />
          </div>
        ))}
      </div>

      <div className="card p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>

      <div className="card space-y-3 p-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
