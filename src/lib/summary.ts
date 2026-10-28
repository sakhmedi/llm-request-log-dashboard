import type { LlmRequest } from '../types';

export interface Summary {
  totalRequests: number;
  /** Доля ответов 429 и 500 в процентах, с точностью до 0.1. */
  errorRatePercent: number;
  /** Средняя задержка по всем запросам, целые миллисекунды. */
  avgLatencyMs: number;
  /** Суммарная стоимость в долларах, округлена до 6 знаков (убираем «хвосты» float). */
  totalCostUsd: number;
}

/** Округление до N знаков после запятой. */
export function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function summarize(requests: readonly LlmRequest[]): Summary {
  const total = requests.length;
  // Пустой массив: возвращаем нули сразу, чтобы не делить на 0 (иначе получим NaN).
  if (total === 0) {
    return { totalRequests: 0, errorRatePercent: 0, avgLatencyMs: 0, totalCostUsd: 0 };
  }

  let errors = 0;
  let latencySum = 0;
  let costSum = 0;
  for (const request of requests) {
    if (request.status !== 200) errors += 1;
    latencySum += request.latencyMs;
    costSum += request.costUsd;
  }

  return {
    totalRequests: total,
    errorRatePercent: roundTo((errors / total) * 100, 1),
    avgLatencyMs: Math.round(latencySum / total),
    totalCostUsd: roundTo(costSum, 6),
  };
}
