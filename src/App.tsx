import { useMemo } from 'react';
import { useRequests } from './hooks/useRequests';
import { useUrlFilters } from './hooks/useUrlFilters';
import { useTheme } from './hooks/useTheme';
import { filterRequests } from './lib/filters';
import { sortRequests } from './lib/sorting';
import { paginate } from './lib/pagination';
import { summarize } from './lib/summary';
import { Filters } from './components/Filters';
import { SummaryCards } from './components/SummaryCards';
import { LatencyChart } from './components/LatencyChart';
import { RequestsTable } from './components/RequestsTable';
import { Pagination } from './components/Pagination';
import { EmptyState } from './components/EmptyState';
import { ErrorState } from './components/ErrorState';
import { ThemeToggle } from './components/ThemeToggle';
import { DashboardSkeleton } from './components/Skeleton';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { state, setFilters, setSort, setPage, resetFilters } = useUrlFilters();
  const { data, error, isPending, isError, isFetching, refetch } = useRequests();

  // Конвейер обработки: все шаги — чистые функции из src/lib.
  // useMemo пересчитывает шаг только когда меняются его входные данные.
  const filtered = useMemo(
    () => (data ? filterRequests(data, state.filters) : []),
    [data, state.filters],
  );
  const sorted = useMemo(() => sortRequests(filtered, state.sort), [filtered, state.sort]);
  const pageResult = useMemo(() => paginate(sorted, state.page), [sorted, state.page]);
  const summary = useMemo(() => summarize(filtered), [filtered]);

  function renderContent() {
    if (isPending) return <DashboardSkeleton />;

    if (isError) {
      return (
        <ErrorState
          message={error.message}
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      );
    }

    if (filtered.length === 0) {
      return (
        <>
          <SummaryCards summary={summary} />
          <EmptyState onReset={resetFilters} />
        </>
      );
    }

    return (
      <>
        <SummaryCards summary={summary} />
        <LatencyChart requests={filtered} isDark={theme === 'dark'} />
        <div className="space-y-4">
          <RequestsTable rows={pageResult.items} sort={state.sort} onSortChange={setSort} />
          <Pagination
            page={pageResult.page}
            totalPages={pageResult.totalPages}
            rangeStart={pageResult.rangeStart}
            rangeEnd={pageResult.rangeEnd}
            totalItems={pageResult.totalItems}
            onPageChange={setPage}
          />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold sm:text-xl">Журнал запросов к LLM</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Запросы к моделям через API-шлюз · время в UTC
            </p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <Filters filters={state.filters} onChange={setFilters} onReset={resetFilters} />
        {renderContent()}
      </main>
    </div>
  );
}
