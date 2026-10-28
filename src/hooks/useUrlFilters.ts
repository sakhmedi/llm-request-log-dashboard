import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EMPTY_FILTERS, type Filters, type SortState, type UrlState } from '../types';
import { parseUrlState, serializeUrlState, toSearchString } from '../lib/urlState';

/**
 * Состояние фильтров живёт в URL, а не в useState.
 *
 * Чтение: URL → parseUrlState() → объект состояния.
 * Запись: новое состояние → serializeUrlState() → navigate() меняет URL →
 *         React Router перерисовывает компонент → снова чтение.
 *
 * Поэтому перезагрузка, копирование ссылки и кнопки «назад/вперёд» работают сами собой:
 * у страницы просто нет другого источника правды.
 */
export function useUrlFilters() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const state = useMemo(() => parseUrlState(searchParams), [searchParams]);

  const commit = useCallback(
    (next: UrlState) => {
      // searchParams передаём как основу, чтобы сохранить «чужие» параметры (simulateError).
      const search = toSearchString(serializeUrlState(next, searchParams));
      // Каждое изменение — новая запись в истории браузера, поэтому «назад» отменяет его.
      navigate({ search });
    },
    [navigate, searchParams],
  );

  /** Меняет часть фильтров. Страница сбрасывается на 1 — старый номер теряет смысл. */
  const setFilters = useCallback(
    (patch: Partial<Filters>) =>
      commit({ ...state, filters: { ...state.filters, ...patch }, page: 1 }),
    [commit, state],
  );

  const setSort = useCallback(
    (sort: SortState) => commit({ ...state, sort, page: 1 }),
    [commit, state],
  );

  const setPage = useCallback((page: number) => commit({ ...state, page }), [commit, state]);

  /** Сбрасывает фильтры и страницу. Сортировку оставляем — это не фильтр. */
  const resetFilters = useCallback(
    () => commit({ ...state, filters: EMPTY_FILTERS, page: 1 }),
    [commit, state],
  );

  return { state, setFilters, setSort, setPage, resetFilters };
}
