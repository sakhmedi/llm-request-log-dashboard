/**
 * Форматирование чисел и дат через Intl. Форматтеры создаём один раз —
 * это дешевле, чем создавать их при каждом рендере строки таблицы.
 * Все даты показываем в UTC — так же, как работают фильтры.
 */
const LOCALE = 'ru-RU';

const usdTotal = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Стоимость одного запроса часто меньше цента — нужны дополнительные знаки.
const usdPrecise = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

const percent = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const dateTime = new Intl.DateTimeFormat(LOCALE, {
  timeZone: 'UTC',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const dayMonth = new Intl.DateTimeFormat(LOCALE, {
  timeZone: 'UTC',
  day: '2-digit',
  month: '2-digit',
});

const dayMonthHour = new Intl.DateTimeFormat(LOCALE, {
  timeZone: 'UTC',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/** $12.34 — для итогов. */
export const formatUsd = (value: number): string => usdTotal.format(value);

/** $0.0012 — для одного запроса. */
export const formatUsdPrecise = (value: number): string => usdPrecise.format(value);

/** 12 345 */
export const formatInteger = (value: number): string => integer.format(value);

/** 1 234 мс */
export const formatMs = (value: number): string => `${integer.format(value)} мс`;

/** 12,5 % — аргумент уже в процентах. */
export const formatPercent = (value: number): string => `${percent.format(value)} %`;

/** 27.10.2026, 14:05:09 */
export const formatDateTime = (iso: string): string => dateTime.format(new Date(iso));

/** Подпись оси графика: «27.10» для дней, «27.10, 14:00» для часов. */
export const formatBucketLabel = (time: number, bucket: 'hour' | 'day'): string =>
  (bucket === 'hour' ? dayMonthHour : dayMonth).format(new Date(time));
