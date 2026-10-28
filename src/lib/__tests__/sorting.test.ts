import { describe, expect, it } from 'vitest';
import { nextSort, sortRequests } from '../sorting';
import { makeRequest } from './fixtures';

const requests = [
  makeRequest({ id: 'a', timestamp: '2026-10-02T00:00:00.000Z', latencyMs: 300, costUsd: 0.02 }),
  makeRequest({ id: 'b', timestamp: '2026-10-03T00:00:00.000Z', latencyMs: 100, costUsd: 0.03 }),
  makeRequest({ id: 'c', timestamp: '2026-10-01T00:00:00.000Z', latencyMs: 200, costUsd: 0.01 }),
];

const ids = (list: { id: string }[]) => list.map((r) => r.id);

describe('sortRequests', () => {
  it('по времени asc/desc', () => {
    expect(ids(sortRequests(requests, { field: 'timestamp', direction: 'asc' }))).toEqual([
      'c',
      'a',
      'b',
    ]);
    expect(ids(sortRequests(requests, { field: 'timestamp', direction: 'desc' }))).toEqual([
      'b',
      'a',
      'c',
    ]);
  });

  it('по задержке asc/desc', () => {
    expect(ids(sortRequests(requests, { field: 'latencyMs', direction: 'asc' }))).toEqual([
      'b',
      'c',
      'a',
    ]);
    expect(ids(sortRequests(requests, { field: 'latencyMs', direction: 'desc' }))).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('по стоимости asc/desc', () => {
    expect(ids(sortRequests(requests, { field: 'costUsd', direction: 'asc' }))).toEqual([
      'c',
      'a',
      'b',
    ]);
    expect(ids(sortRequests(requests, { field: 'costUsd', direction: 'desc' }))).toEqual([
      'b',
      'a',
      'c',
    ]);
  });

  it('стабильна: равные элементы сохраняют исходный порядок в обоих направлениях', () => {
    const equal = [
      makeRequest({ id: '1', costUsd: 0 }),
      makeRequest({ id: '2', costUsd: 0.5 }),
      makeRequest({ id: '3', costUsd: 0 }),
      makeRequest({ id: '4', costUsd: 0 }),
    ];
    expect(ids(sortRequests(equal, { field: 'costUsd', direction: 'asc' }))).toEqual([
      '1',
      '3',
      '4',
      '2',
    ]);
    expect(ids(sortRequests(equal, { field: 'costUsd', direction: 'desc' }))).toEqual([
      '2',
      '1',
      '3',
      '4',
    ]);
  });

  it('не меняет исходный массив', () => {
    const before = ids(requests);
    sortRequests(requests, { field: 'latencyMs', direction: 'asc' });
    expect(ids(requests)).toEqual(before);
  });
});

describe('nextSort', () => {
  it('клик по активной колонке меняет направление', () => {
    expect(nextSort({ field: 'costUsd', direction: 'desc' }, 'costUsd')).toEqual({
      field: 'costUsd',
      direction: 'asc',
    });
    expect(nextSort({ field: 'costUsd', direction: 'asc' }, 'costUsd')).toEqual({
      field: 'costUsd',
      direction: 'desc',
    });
  });

  it('клик по новой колонке начинает с desc', () => {
    expect(nextSort({ field: 'timestamp', direction: 'asc' }, 'latencyMs')).toEqual({
      field: 'latencyMs',
      direction: 'desc',
    });
  });
});
