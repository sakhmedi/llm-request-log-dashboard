import { describe, expect, it } from 'vitest';
import { buildLatencySeries, chooseBucket, percentile } from '../chart';
import { makeRequest } from './fixtures';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe('percentile', () => {
  it('пустой массив → 0', () => {
    expect(percentile([], 95)).toBe(0);
  });

  it('метод ближайшего ранга', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1); // 1..100
    expect(percentile(values, 95)).toBe(95);
    expect(percentile(values, 50)).toBe(50);
    expect(percentile([5, 1, 3], 95)).toBe(5);
  });
});

describe('chooseBucket', () => {
  it('до 3 дней — по часам, больше — по дням', () => {
    expect(chooseBucket(3 * DAY)).toBe('hour');
    expect(chooseBucket(3 * DAY + 1)).toBe('day');
  });
});

describe('buildLatencySeries', () => {
  it('пустой вход → нет точек', () => {
    expect(buildLatencySeries([]).points).toEqual([]);
  });

  it('группирует по часам и считает среднее и p95', () => {
    const series = buildLatencySeries([
      makeRequest({ timestamp: '2026-10-10T10:05:00.000Z', latencyMs: 100 }),
      makeRequest({ timestamp: '2026-10-10T10:55:00.000Z', latencyMs: 300 }),
      makeRequest({ timestamp: '2026-10-10T12:00:00.000Z', latencyMs: 50 }),
    ]);
    expect(series.bucket).toBe('hour');
    expect(series.points).toEqual([
      { time: Date.UTC(2026, 9, 10, 10), avgLatencyMs: 200, p95LatencyMs: 300, count: 2 },
      { time: Date.UTC(2026, 9, 10, 12), avgLatencyMs: 50, p95LatencyMs: 50, count: 1 },
    ]);
  });

  it('для широкого диапазона группирует по дням в порядке времени', () => {
    const series = buildLatencySeries([
      makeRequest({ timestamp: '2026-10-20T08:00:00.000Z', latencyMs: 10 }),
      makeRequest({ timestamp: '2026-10-01T08:00:00.000Z', latencyMs: 20 }),
    ]);
    expect(series.bucket).toBe('day');
    expect(series.points.map((p) => p.time)).toEqual([Date.UTC(2026, 9, 1), Date.UTC(2026, 9, 20)]);
  });
});
