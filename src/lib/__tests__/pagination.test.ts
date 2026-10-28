import { describe, expect, it } from 'vitest';
import { paginate } from '../pagination';

// 45 элементов: 1, 2, …, 45. При размере 20 — страницы 20 + 20 + 5.
const items = Array.from({ length: 45 }, (_, i) => i + 1);

describe('paginate', () => {
  it('первая страница', () => {
    const result = paginate(items, 1, 20);
    expect(result.items).toHaveLength(20);
    expect(result.items[0]).toBe(1);
    expect(result).toMatchObject({
      page: 1,
      totalPages: 3,
      totalItems: 45,
      rangeStart: 1,
      rangeEnd: 20,
    });
  });

  it('средняя страница', () => {
    const result = paginate(items, 2, 20);
    expect(result.items[0]).toBe(21);
    expect(result).toMatchObject({ rangeStart: 21, rangeEnd: 40 });
  });

  it('последняя неполная страница', () => {
    const result = paginate(items, 3, 20);
    expect(result.items).toEqual([41, 42, 43, 44, 45]);
    expect(result).toMatchObject({ page: 3, rangeStart: 41, rangeEnd: 45 });
  });

  it('страница больше максимума → последняя', () => {
    const result = paginate(items, 99, 20);
    expect(result.page).toBe(3);
    expect(result.items).toHaveLength(5);
  });

  it('страница меньше 1, дробная или NaN → приводится к допустимой', () => {
    expect(paginate(items, 0, 20).page).toBe(1);
    expect(paginate(items, -5, 20).page).toBe(1);
    expect(paginate(items, 2.7, 20).page).toBe(2);
    expect(paginate(items, Number.NaN, 20).page).toBe(1);
  });

  it('ровно заполненные страницы', () => {
    const result = paginate(items.slice(0, 40), 2, 20);
    expect(result).toMatchObject({ totalPages: 2, rangeStart: 21, rangeEnd: 40 });
  });

  it('пустой список: одна страница, показано 0–0', () => {
    expect(paginate([], 1, 20)).toEqual({
      items: [],
      page: 1,
      totalPages: 1,
      totalItems: 0,
      rangeStart: 0,
      rangeEnd: 0,
    });
  });

  it('по умолчанию 20 на страницу', () => {
    expect(paginate(items, 1).items).toHaveLength(20);
  });
});
