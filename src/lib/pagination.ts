import { PAGE_SIZE } from '../types';

export interface PageResult<T> {
  /** Элементы текущей страницы. */
  items: T[];
  /** Фактический номер страницы (после приведения к допустимому диапазону). */
  page: number;
  totalPages: number;
  totalItems: number;
  /** Номер первого показанного элемента, считая с 1 (0, если элементов нет). */
  rangeStart: number;
  /** Номер последнего показанного элемента (0, если элементов нет). */
  rangeEnd: number;
}

/**
 * Режет массив на страницы. Номер страницы приводится к диапазону [1, totalPages]:
 * ?page=999 покажет последнюю страницу, а не пустую таблицу.
 * Даже для пустого массива totalPages = 1, чтобы не было «страница 1 из 0».
 */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number = PAGE_SIZE,
): PageResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Number.isFinite(page) ? Math.floor(page) : 1;
  const currentPage = Math.min(Math.max(safePage, 1), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: pageItems,
    page: currentPage,
    totalPages,
    totalItems,
    rangeStart: totalItems === 0 ? 0 : startIndex + 1,
    rangeEnd: startIndex + pageItems.length,
  };
}
