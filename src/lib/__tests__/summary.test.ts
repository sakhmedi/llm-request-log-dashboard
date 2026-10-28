import { describe, expect, it } from 'vitest';
import { roundTo, summarize } from '../summary';
import { makeRequest } from './fixtures';

describe('summarize', () => {
  it('пустой массив → нули без NaN', () => {
    const summary = summarize([]);
    expect(summary).toEqual({
      totalRequests: 0,
      errorRatePercent: 0,
      avgLatencyMs: 0,
      totalCostUsd: 0,
    });
    Object.values(summary).forEach((value) => expect(Number.isNaN(value)).toBe(false));
  });

  it('считает число запросов, долю ошибок, среднюю задержку и стоимость', () => {
    const summary = summarize([
      makeRequest({ status: 200, latencyMs: 1000, costUsd: 0.5 }),
      makeRequest({ status: 200, latencyMs: 2000, costUsd: 0.25 }),
      makeRequest({ status: 429, latencyMs: 100, costUsd: 0 }),
      makeRequest({ status: 500, latencyMs: 900, costUsd: 0 }),
    ]);
    expect(summary.totalRequests).toBe(4);
    expect(summary.errorRatePercent).toBe(50); // 429 + 500 из 4
    expect(summary.avgLatencyMs).toBe(1000); // (1000+2000+100+900)/4
    expect(summary.totalCostUsd).toBe(0.75);
  });

  it('без ошибок доля ошибок = 0', () => {
    expect(summarize([makeRequest({ status: 200 })]).errorRatePercent).toBe(0);
  });

  it('округляет долю ошибок до 0.1 и задержку до целых', () => {
    const summary = summarize([
      makeRequest({ status: 429, latencyMs: 100 }),
      makeRequest({ status: 200, latencyMs: 100 }),
      makeRequest({ status: 200, latencyMs: 101 }),
    ]);
    expect(summary.errorRatePercent).toBe(33.3); // 33.333…
    expect(summary.avgLatencyMs).toBe(100); // 100.333…
  });

  it('убирает «хвосты» плавающей точки в сумме стоимости', () => {
    // 0.1 + 0.2 в JS = 0.30000000000000004
    const summary = summarize([makeRequest({ costUsd: 0.1 }), makeRequest({ costUsd: 0.2 })]);
    expect(summary.totalCostUsd).toBe(0.3);
  });
});

describe('roundTo', () => {
  it('округляет до нужного числа знаков', () => {
    expect(roundTo(1.2345, 2)).toBe(1.23);
    expect(roundTo(1.235, 1)).toBe(1.2);
    expect(roundTo(5, 3)).toBe(5);
  });
});
