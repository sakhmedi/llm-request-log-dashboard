import type { LlmRequest } from '../../types';

/** Создаёт запись с разумными значениями по умолчанию — в тесте меняем только важное. */
export function makeRequest(overrides: Partial<LlmRequest> = {}): LlmRequest {
  return {
    id: 'req_test',
    timestamp: '2026-10-10T12:00:00.000Z',
    model: 'gpt-4o',
    status: 200,
    inputTokens: 100,
    outputTokens: 50,
    latencyMs: 1000,
    costUsd: 0.001,
    ...overrides,
  };
}
