/**
 * Генератор демо-данных: `npm run generate` → public/data/requests.json
 *
 * Используется детерминированный генератор случайных чисел (mulberry32)
 * с фиксированным seed и фиксированной «текущей» датой, поэтому при каждом
 * запуске получается байт-в-байт одинаковый файл.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODEL_PRICING, type ModelName, type RequestStatus } from '../src/types';
import type { LlmRequest } from '../src/api/schema';

const SEED = 20261027;
const RECORD_COUNT = 600;
/** Конец 30-дневного окна. Фиксирован, чтобы данные не менялись со временем. */
const END_DATE = Date.UTC(2026, 9, 27, 18, 0, 0); // 27 октября 2026, 18:00 UTC
const DAY_MS = 24 * 60 * 60 * 1000;
const START_DATE = END_DATE - 30 * DAY_MS;

/** mulberry32 — маленький и быстрый ГПСЧ. Возвращает функцию, дающую числа в [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(SEED);

const between = (min: number, max: number): number => min + random() * (max - min);

/** Лог-равномерное распределение: маленьких значений больше, чем больших (как у токенов). */
const logBetween = (min: number, max: number): number =>
  Math.exp(between(Math.log(min), Math.log(max)));

/** Выбор по весам: [['a', 3], ['b', 1]] → 'a' в 75% случаев. */
function weightedPick<T>(items: ReadonlyArray<readonly [T, number]>): T {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0);
  let r = random() * total;
  for (const [item, weight] of items) {
    r -= weight;
    if (r < 0) return item;
  }
  const last = items[items.length - 1];
  if (!last) throw new Error('weightedPick: пустой список');
  return last[0];
}

const MODEL_WEIGHTS: ReadonlyArray<readonly [ModelName, number]> = [
  ['gpt-4o', 20],
  ['gpt-4o-mini', 30],
  ['claude-sonnet', 18],
  ['claude-haiku', 20],
  ['llama-3-70b', 12],
];

/** Профиль скорости модели: время до первого токена и время на каждый выходной токен. */
const LATENCY_PROFILE: Record<ModelName, { baseMs: number; perTokenMs: number }> = {
  'gpt-4o': { baseMs: 450, perTokenMs: 12 },
  'gpt-4o-mini': { baseMs: 300, perTokenMs: 7 },
  'claude-sonnet': { baseMs: 600, perTokenMs: 14 },
  'claude-haiku': { baseMs: 250, perTokenMs: 6 },
  'llama-3-70b': { baseMs: 350, perTokenMs: 10 },
};

function pickStatus(): RequestStatus {
  const r = random();
  if (r < 0.88) return 200;
  if (r < 0.96) return 429;
  return 500;
}

function makeRecord(): Omit<LlmRequest, 'id'> {
  const model = weightedPick(MODEL_WEIGHTS);
  const status = pickStatus();
  const timestamp = new Date(Math.round(between(START_DATE, END_DATE))).toISOString();
  const inputTokens = Math.round(logBetween(80, 8000));
  const { baseMs, perTokenMs } = LATENCY_PROFILE[model];

  if (status === 429) {
    // Лимит запросов: шлюз отвечает быстро, модель не вызывается.
    const latencyMs = Math.round(between(15, 120));
    return { timestamp, model, status, inputTokens, outputTokens: 0, latencyMs, costUsd: 0 };
  }
  if (status === 500) {
    // Ошибка модели: могла «подвиснуть» перед падением.
    const latencyMs = Math.round(baseMs * between(1, 8));
    return { timestamp, model, status, inputTokens, outputTokens: 0, latencyMs, costUsd: 0 };
  }

  const outputTokens = Math.round(logBetween(20, 1500));
  let latencyMs = (baseMs + outputTokens * perTokenMs) * between(0.8, 1.25);
  // Редкие выбросы (~1.5%): перегрузка провайдера.
  if (random() < 0.015) latencyMs *= between(3, 6);

  const pricing = MODEL_PRICING[model];
  const costUsd =
    (inputTokens * pricing.inputPerMillion + outputTokens * pricing.outputPerMillion) / 1_000_000;

  return {
    timestamp,
    model,
    status,
    inputTokens,
    outputTokens,
    latencyMs: Math.round(latencyMs),
    costUsd: Number(costUsd.toFixed(6)),
  };
}

const records: LlmRequest[] = Array.from({ length: RECORD_COUNT }, makeRecord)
  // Сначала новые — так обычно отдают журналы.
  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  .map((record, index) => ({ id: `req_${String(index + 1).padStart(4, '0')}`, ...record }));

// Одна запись на строку: файл и компактный, и читаемый.
const json = '[\n' + records.map((r) => '  ' + JSON.stringify(r)).join(',\n') + '\n]\n';

const outFile = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/requests.json');
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, json);

const count = (status: RequestStatus) => records.filter((r) => r.status === status).length;
console.log(
  `Сгенерировано ${records.length} записей → ${outFile}\n` +
    `  200: ${count(200)}, 429: ${count(429)}, 500: ${count(500)}`,
);
