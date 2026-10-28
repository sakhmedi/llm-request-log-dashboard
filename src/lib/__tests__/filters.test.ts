import { describe, expect, it } from 'vitest';
import { filterRequests, hasActiveFilters, parseIsoDay } from '../filters';
import { EMPTY_FILTERS, type Filters } from '../../types';
import { makeRequest } from './fixtures';

const requests = [
  makeRequest({ id: 'a', model: 'gpt-4o', status: 200, timestamp: '2026-10-01T00:00:00.000Z' }),
  makeRequest({
    id: 'b',
    model: 'claude-haiku',
    status: 429,
    timestamp: '2026-10-05T10:00:00.000Z',
  }),
  makeRequest({
    id: 'c',
    model: 'claude-sonnet',
    status: 500,
    timestamp: '2026-10-10T23:59:59.999Z',
  }),
  makeRequest({ id: 'd', model: 'gpt-4o', status: 429, timestamp: '2026-10-11T00:00:00.000Z' }),
  makeRequest({
    id: 'e',
    model: 'llama-3-70b',
    status: 200,
    timestamp: '2026-09-30T23:59:59.999Z',
  }),
];

const ids = (filters: Partial<Filters>) =>
  filterRequests(requests, { ...EMPTY_FILTERS, ...filters }).map((r) => r.id);

describe('filterRequests', () => {
  it('пустой фильтр возвращает все записи', () => {
    expect(ids({})).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('фильтрует по одной модели', () => {
    expect(ids({ models: ['gpt-4o'] })).toEqual(['a', 'd']);
  });

  it('фильтрует по нескольким моделям', () => {
    expect(ids({ models: ['claude-haiku', 'claude-sonnet'] })).toEqual(['b', 'c']);
  });

  it('фильтрует по статусу', () => {
    expect(ids({ statuses: [429] })).toEqual(['b', 'd']);
    expect(ids({ statuses: [429, 500] })).toEqual(['b', 'c', 'd']);
  });

  it('граница «с» включительна с начала дня', () => {
    expect(ids({ from: '2026-10-01' })).toEqual(['a', 'b', 'c', 'd']); // e — за миллисекунду до
  });

  it('граница «по» включает весь день до 23:59:59.999', () => {
    expect(ids({ to: '2026-10-10' })).toEqual(['a', 'b', 'c', 'e']); // d — уже следующий день
  });

  it('диапазон из одного дня', () => {
    expect(ids({ from: '2026-10-10', to: '2026-10-10' })).toEqual(['c']);
  });

  it('комбинация фильтров работает как «И»', () => {
    expect(ids({ models: ['gpt-4o'], statuses: [429], from: '2026-10-02' })).toEqual(['d']);
  });

  it('возвращает пустой массив, если ничего не подошло', () => {
    expect(ids({ models: ['gpt-4o-mini'] })).toEqual([]);
    expect(ids({ from: '2026-10-20', to: '2026-10-01' })).toEqual([]);
  });

  it('не меняет исходный массив', () => {
    const copy = [...requests];
    filterRequests(requests, { ...EMPTY_FILTERS, models: ['gpt-4o'] });
    expect(requests).toEqual(copy);
  });
});

describe('parseIsoDay', () => {
  it('разбирает корректную дату в начало дня UTC', () => {
    expect(parseIsoDay('2026-10-01')).toBe(Date.UTC(2026, 9, 1));
  });

  it('отвергает мусор и несуществующие даты', () => {
    expect(parseIsoDay('2026-02-30')).toBeNull();
    expect(parseIsoDay('2026-13-01')).toBeNull();
    expect(parseIsoDay('01.10.2026')).toBeNull();
    expect(parseIsoDay('')).toBeNull();
  });
});

describe('hasActiveFilters', () => {
  it('false для пустых фильтров и true, если что-то выбрано', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, to: '2026-10-01' })).toBe(true);
  });
});
