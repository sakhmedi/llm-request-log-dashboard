import { z } from 'zod';
import { MODELS } from '../types';

/**
 * Схема одной записи журнала. Если JSON не совпадёт со схемой,
 * fetchRequests() бросит ошибку и пользователь увидит состояние ошибки,
 * а не «сломанную» таблицу.
 */
export const llmRequestSchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().datetime(), // ISO 8601 в UTC, например 2026-10-01T12:00:00.000Z
  model: z.enum(MODELS),
  status: z.union([z.literal(200), z.literal(429), z.literal(500)]),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  latencyMs: z.number().nonnegative(),
  costUsd: z.number().nonnegative(),
});

export const requestsResponseSchema = z.array(llmRequestSchema);

/** Тип записи получаем из схемы — он всегда совпадает с проверкой. */
export type LlmRequest = z.infer<typeof llmRequestSchema>;
