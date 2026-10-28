import type { LlmRequest, SortField, SortState } from '../types';

/** Числовое значение поля для сравнения. Время превращаем в миллисекунды. */
function sortValue(request: LlmRequest, field: SortField): number {
  switch (field) {
    case 'timestamp':
      return Date.parse(request.timestamp);
    case 'latencyMs':
      return request.latencyMs;
    case 'costUsd':
      return request.costUsd;
  }
}

/**
 * Возвращает НОВЫЙ отсортированный массив (исходный не меняется).
 * Array.prototype.sort стабилен (ES2019+): записи с равными значениями
 * сохраняют исходный порядок — и при asc, и при desc.
 */
export function sortRequests(requests: readonly LlmRequest[], sort: SortState): LlmRequest[] {
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...requests].sort((a, b) => (sortValue(a, sort.field) - sortValue(b, sort.field)) * sign);
}

/**
 * Что делает клик по заголовку колонки:
 * та же колонка — меняем направление; новая колонка — начинаем с desc
 * (самое новое / самое медленное / самое дорогое сверху).
 */
export function nextSort(current: SortState, field: SortField): SortState {
  if (current.field === field) {
    return { field, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { field, direction: 'desc' };
}
