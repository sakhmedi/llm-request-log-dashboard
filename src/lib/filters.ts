import type { Filters, LlmRequest } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Превращает 'YYYY-MM-DD' в миллисекунды начала этого дня по UTC.
 * Возвращает null для мусора и несуществующих дат (например, 2026-02-30).
 */
export function parseIsoDay(value: string): number | null {
  const match = ISO_DAY_RE.exec(value);
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  if (y === undefined || m === undefined || d === undefined) return null;

  const ms = Date.UTC(y, m - 1, d);
  const date = new Date(ms);
  // Date.UTC «переносит» лишние дни (30 февраля → 2 марта) — ловим это сравнением.
  const isRealDate =
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  return isRealDate ? ms : null;
}

export function isValidIsoDay(value: string): boolean {
  return parseIsoDay(value) !== null;
}

/**
 * Фильтрует записи. Пустой список моделей/статусов означает «все».
 * Границы дат включительные: `to` охватывает весь день до 23:59:59.999 UTC.
 */
export function filterRequests(requests: readonly LlmRequest[], filters: Filters): LlmRequest[] {
  const fromMs = filters.from ? parseIsoDay(filters.from) : null;
  const toDayMs = filters.to ? parseIsoDay(filters.to) : null;
  // Берём начало СЛЕДУЮЩЕГО дня и сравниваем строго «меньше» — так весь день «по» попадает в выборку.
  const toExclusiveMs = toDayMs === null ? null : toDayMs + DAY_MS;

  return requests.filter((request) => {
    if (filters.models.length > 0 && !filters.models.includes(request.model)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(request.status)) return false;

    if (fromMs !== null || toExclusiveMs !== null) {
      const time = Date.parse(request.timestamp);
      if (fromMs !== null && time < fromMs) return false;
      if (toExclusiveMs !== null && time >= toExclusiveMs) return false;
    }
    return true;
  });
}

/** Есть ли хоть один активный фильтр (нужно для кнопки «Сбросить»). */
export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.models.length > 0 ||
    filters.statuses.length > 0 ||
    filters.from !== null ||
    filters.to !== null
  );
}
