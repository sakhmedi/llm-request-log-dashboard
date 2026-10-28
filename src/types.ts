/**
 * Общие типы и константы приложения.
 *
 * Списки допустимых значений объявлены как `as const`-массивы: из них
 * получаются и union-типы (для TypeScript), и значения для проверок в рантайме
 * (zod-схема, разбор URL). Так список моделей задан ровно в одном месте.
 */

export const MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'claude-sonnet',
  'claude-haiku',
  'llama-3-70b',
] as const;
export type ModelName = (typeof MODELS)[number];

export const STATUSES = [200, 429, 500] as const;
export type RequestStatus = (typeof STATUSES)[number];

/** Цена модели в долларах за 1 млн токенов (демо-значения). */
export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

export const MODEL_PRICING: Record<ModelName, ModelPricing> = {
  'gpt-4o': { inputPerMillion: 2.5, outputPerMillion: 10 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'claude-sonnet': { inputPerMillion: 3, outputPerMillion: 15 },
  'claude-haiku': { inputPerMillion: 0.8, outputPerMillion: 4 },
  'llama-3-70b': { inputPerMillion: 0.59, outputPerMillion: 0.79 },
};

// Сам тип записи выводится из zod-схемы (см. src/api/schema.ts).
// `export type` стирается при компиляции, поэтому циклического импорта в рантайме нет.
export type { LlmRequest } from './api/schema';

/** Поля, по которым можно сортировать таблицу. */
export const SORT_FIELDS = ['timestamp', 'latencyMs', 'costUsd'] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

/** Фильтры. Даты — строки 'YYYY-MM-DD' (как у <input type="date">), трактуются в UTC. */
export interface Filters {
  models: ModelName[];
  statuses: RequestStatus[];
  from: string | null;
  to: string | null;
}

/** Всё состояние страницы, которое хранится в URL. */
export interface UrlState {
  filters: Filters;
  sort: SortState;
  page: number;
}

export const PAGE_SIZE = 20;

export const DEFAULT_SORT: SortState = { field: 'timestamp', direction: 'desc' };

export const EMPTY_FILTERS: Filters = { models: [], statuses: [], from: null, to: null };
