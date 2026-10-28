import { requestsResponseSchema, type LlmRequest } from './schema';

// BASE_URL учитывает `base` из vite.config.ts (важно, если деплоить не в корень домена).
const DATA_URL = `${import.meta.env.BASE_URL}data/requests.json`;

export interface FetchRequestsOptions {
  /** Имитировать ошибку сервера (включается параметром ?simulateError=1). */
  simulateError?: boolean;
  /** Сигнал отмены от TanStack Query: запрос отменяется, если он больше не нужен. */
  signal?: AbortSignal;
}

/** Пауза, которую можно прервать через AbortSignal. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

/** Случайная задержка 600–1200 мс — как будто данные идут по сети. */
const randomNetworkDelay = (): number => 600 + Math.random() * 600;

/**
 * Загружает журнал запросов и проверяет его zod-схемой.
 * В случае любой проблемы бросает Error с понятным сообщением —
 * TanStack Query положит его в `error` и покажет состояние ошибки.
 */
export async function fetchRequests(options: FetchRequestsOptions = {}): Promise<LlmRequest[]> {
  const { simulateError = false, signal } = options;

  await delay(randomNetworkDelay(), signal);

  if (simulateError) {
    throw new Error('Сервер вернул ошибку 503 (имитация через ?simulateError=1).');
  }

  const response = await fetch(DATA_URL, { signal });
  if (!response.ok) {
    throw new Error(`Не удалось загрузить данные: HTTP ${response.status}.`);
  }

  // res.json() возвращает any — сразу сужаем до unknown и отдаём на проверку схеме.
  const json: unknown = await response.json();
  const parsed = requestsResponseSchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue ? `${issue.path.join('.')}: ${issue.message}` : 'неизвестная ошибка';
    throw new Error(`Данные имеют неверный формат (${where}).`);
  }
  return parsed.data;
}
