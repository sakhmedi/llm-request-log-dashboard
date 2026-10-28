import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchRequests } from '../api/requests';

/**
 * Загрузка журнала через TanStack Query.
 *
 * - queryKey — «адрес» данных в кэше. simulateError входит в ключ,
 *   поэтому при его смене данные загружаются заново.
 * - staleTime — 5 минут данные считаются свежими и повторно не запрашиваются.
 * - retry: 1 — при ошибке делаем одну повторную попытку, потом показываем ошибку.
 *
 * Фильтры в ключ НЕ входят: файл грузится один раз, фильтруем на клиенте.
 */
export function useRequests() {
  const [searchParams] = useSearchParams();
  const simulateError = searchParams.get('simulateError') === '1';

  return useQuery({
    queryKey: ['requests', { simulateError }],
    queryFn: ({ signal }) => fetchRequests({ simulateError, signal }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
