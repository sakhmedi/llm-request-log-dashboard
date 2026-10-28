import type { LlmRequest } from '../types';

export type Bucket = 'hour' | 'day';

export interface ChartPoint {
  /** Начало интервала (часа или дня) в мс, UTC. */
  time: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  count: number;
}

export interface LatencySeries {
  bucket: Bucket;
  points: ChartPoint[];
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
/** Если данные укладываются в 3 дня — группируем по часам, иначе по дням. */
const HOURLY_MAX_RANGE_MS = 3 * DAY_MS;

export function chooseBucket(rangeMs: number): Bucket {
  return rangeMs <= HOURLY_MAX_RANGE_MS ? 'hour' : 'day';
}

/**
 * Перцентиль методом «ближайшего ранга»: p95 — это значение, меньше или равно
 * которому 95% замеров. Всегда возвращает одно из реальных значений.
 */
export function percentile(values: readonly number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  const index = Math.min(Math.max(rank - 1, 0), sorted.length - 1);
  return sorted[index] ?? 0;
}

/** Строит точки графика: средняя задержка и p95 для каждого часа/дня. */
export function buildLatencySeries(requests: readonly LlmRequest[]): LatencySeries {
  if (requests.length === 0) return { bucket: 'day', points: [] };

  const times = requests.map((r) => Date.parse(r.timestamp));
  const range = Math.max(...times) - Math.min(...times);
  const bucket = chooseBucket(range);
  const size = bucket === 'hour' ? HOUR_MS : DAY_MS;

  // Группируем задержки по началу интервала (Map сохраняет порядок вставки, но мы всё равно отсортируем).
  const groups = new Map<number, number[]>();
  requests.forEach((request, i) => {
    const time = times[i] ?? 0;
    const start = time - (time % size); // округление вниз до часа/дня по UTC
    const group = groups.get(start);
    if (group) group.push(request.latencyMs);
    else groups.set(start, [request.latencyMs]);
  });

  const points: ChartPoint[] = [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([time, latencies]) => ({
      time,
      avgLatencyMs: Math.round(latencies.reduce((sum, v) => sum + v, 0) / latencies.length),
      p95LatencyMs: percentile(latencies, 95),
      count: latencies.length,
    }));

  return { bucket, points };
}
