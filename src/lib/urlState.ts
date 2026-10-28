import {
  DEFAULT_SORT,
  MODELS,
  SORT_DIRECTIONS,
  SORT_FIELDS,
  STATUSES,
  type ModelName,
  type RequestStatus,
  type SortDirection,
  type SortField,
  type SortState,
  type UrlState,
} from '../types';
import { isValidIsoDay } from './filters';

/**
 * Синхронизация состояния с URL.
 *
 * Пример: ?model=gpt-4o,claude-haiku&status=429,500&from=2026-10-01&to=2026-10-15&sort=latencyMs:desc&page=2
 *
 * Правило: всё, что не удалось разобрать, молча заменяется значением по умолчанию.
 * Испорченная ссылка не ломает страницу.
 */

/** Ключи, которыми управляет это состояние. Прочие параметры (например, simulateError) не трогаем. */
export const URL_KEYS = ['model', 'status', 'from', 'to', 'sort', 'page'] as const;

// Type guards: после проверки TypeScript «знает», что строка — это ModelName и т.п.
const isModel = (value: string): value is ModelName =>
  (MODELS as readonly string[]).includes(value);
const isStatus = (value: number): value is RequestStatus =>
  (STATUSES as readonly number[]).includes(value);
const isSortField = (value: string): value is SortField =>
  (SORT_FIELDS as readonly string[]).includes(value);
const isSortDirection = (value: string): value is SortDirection =>
  (SORT_DIRECTIONS as readonly string[]).includes(value);

/** 'a, b,,c' → ['a', 'b', 'c'] */
function splitList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parseModels(raw: string | null): ModelName[] {
  const valid = new Set(splitList(raw).filter(isModel));
  // Порядок как в MODELS: одинаковый выбор → одинаковый URL.
  return MODELS.filter((model) => valid.has(model));
}

function parseStatuses(raw: string | null): RequestStatus[] {
  // Number('429') → 429; Number('abc') → NaN, такое отфильтрует isStatus.
  const valid = new Set(splitList(raw).map(Number).filter(isStatus));
  return STATUSES.filter((status) => valid.has(status));
}

function parseDate(raw: string | null): string | null {
  return raw !== null && isValidIsoDay(raw) ? raw : null;
}

/** 'latencyMs:desc' → { field: 'latencyMs', direction: 'desc' }; мусор → сортировка по умолчанию. */
export function parseSort(raw: string | null): SortState {
  if (!raw) return DEFAULT_SORT;
  const [field, direction] = raw.split(':');
  if (field && direction && isSortField(field) && isSortDirection(direction)) {
    return { field, direction };
  }
  return DEFAULT_SORT;
}

function parsePage(raw: string | null): number {
  // Только положительные целые без мусора: '2' ок, '2abc', '-1', '1.5' — нет.
  if (!raw || !/^\d+$/.test(raw)) return 1;
  const page = Number(raw);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export function parseUrlState(params: URLSearchParams): UrlState {
  return {
    filters: {
      models: parseModels(params.get('model')),
      statuses: parseStatuses(params.get('status')),
      from: parseDate(params.get('from')),
      to: parseDate(params.get('to')),
    },
    sort: parseSort(params.get('sort')),
    page: parsePage(params.get('page')),
  };
}

/**
 * Записывает состояние в URLSearchParams. Значения по умолчанию не пишем,
 * чтобы ссылка оставалась короткой. Параметры из `base`, которыми мы не управляем,
 * сохраняются.
 */
export function serializeUrlState(
  state: UrlState,
  base: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const params = new URLSearchParams(base);
  URL_KEYS.forEach((key) => params.delete(key));

  const { filters, sort, page } = state;
  if (filters.models.length > 0) params.set('model', filters.models.join(','));
  if (filters.statuses.length > 0) params.set('status', filters.statuses.join(','));
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (sort.field !== DEFAULT_SORT.field || sort.direction !== DEFAULT_SORT.direction) {
    params.set('sort', `${sort.field}:${sort.direction}`);
  }
  if (page > 1) params.set('page', String(page));
  return params;
}

/**
 * URLSearchParams кодирует ',' как %2C и ':' как %3A. Это корректно, но некрасиво.
 * В query-строке эти символы разрешены (RFC 3986), поэтому возвращаем их обратно.
 */
export function toSearchString(params: URLSearchParams): string {
  const query = params.toString().replace(/%2C/gi, ',').replace(/%3A/gi, ':');
  return query ? `?${query}` : '';
}
