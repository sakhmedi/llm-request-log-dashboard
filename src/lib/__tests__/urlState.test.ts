import { describe, expect, it } from 'vitest';
import { parseUrlState, serializeUrlState, toSearchString } from '../urlState';
import { DEFAULT_SORT, EMPTY_FILTERS, type UrlState } from '../../types';

const parse = (query: string) => parseUrlState(new URLSearchParams(query));
const DEFAULT_STATE: UrlState = { filters: EMPTY_FILTERS, sort: DEFAULT_SORT, page: 1 };

describe('parseUrlState', () => {
  it('пустой URL → состояние по умолчанию', () => {
    expect(parse('')).toEqual(DEFAULT_STATE);
  });

  it('разбирает полный пример из ТЗ', () => {
    expect(
      parse(
        'model=gpt-4o,claude-haiku&status=429,500&from=2026-10-01&to=2026-10-15&sort=latencyMs:desc&page=2',
      ),
    ).toEqual({
      filters: {
        models: ['gpt-4o', 'claude-haiku'],
        statuses: [429, 500],
        from: '2026-10-01',
        to: '2026-10-15',
      },
      sort: { field: 'latencyMs', direction: 'desc' },
      page: 2,
    });
  });

  it('понимает закодированные запятые и двоеточия', () => {
    const state = parse('model=gpt-4o%2Cclaude-haiku&sort=costUsd%3Aasc');
    expect(state.filters.models).toEqual(['gpt-4o', 'claude-haiku']);
    expect(state.sort).toEqual({ field: 'costUsd', direction: 'asc' });
  });

  it('игнорирует мусор, оставляя корректные значения', () => {
    const state = parse(
      'model=gpt-4o,gpt-5,,<script>&status=200,404,abc&from=2026-02-30&to=yesterday&sort=name:up&page=-3',
    );
    expect(state).toEqual({
      filters: { models: ['gpt-4o'], statuses: [200], from: null, to: null },
      sort: DEFAULT_SORT,
      page: 1,
    });
  });

  it('отвергает некорректные номера страниц', () => {
    expect(parse('page=0').page).toBe(1);
    expect(parse('page=1.5').page).toBe(1);
    expect(parse('page=2abc').page).toBe(1);
    expect(parse('page=99999999999999999999').page).toBe(1);
  });

  it('убирает дубли и приводит порядок к каноническому', () => {
    const state = parse('model=claude-haiku,gpt-4o,claude-haiku&status=500,200,500');
    expect(state.filters.models).toEqual(['gpt-4o', 'claude-haiku']);
    expect(state.filters.statuses).toEqual([200, 500]);
  });

  it('частично битая сортировка → по умолчанию', () => {
    expect(parse('sort=latencyMs').sort).toEqual(DEFAULT_SORT);
    expect(parse('sort=latencyMs:sideways').sort).toEqual(DEFAULT_SORT);
  });
});

describe('serializeUrlState', () => {
  it('состояние по умолчанию → пустая строка', () => {
    expect(toSearchString(serializeUrlState(DEFAULT_STATE))).toBe('');
  });

  it('пишет читаемый URL без %2C и %3A', () => {
    const state: UrlState = {
      filters: {
        models: ['gpt-4o', 'claude-haiku'],
        statuses: [429, 500],
        from: '2026-10-01',
        to: '2026-10-15',
      },
      sort: { field: 'latencyMs', direction: 'desc' },
      page: 2,
    };
    expect(toSearchString(serializeUrlState(state))).toBe(
      '?model=gpt-4o,claude-haiku&status=429,500&from=2026-10-01&to=2026-10-15&sort=latencyMs:desc&page=2',
    );
  });

  it('сохраняет посторонние параметры (simulateError)', () => {
    const base = new URLSearchParams('simulateError=1&page=5');
    const params = serializeUrlState(DEFAULT_STATE, base);
    expect(params.get('simulateError')).toBe('1');
    expect(params.has('page')).toBe(false);
  });

  it('туда-обратно: parse(serialize(state)) === state', () => {
    const states: UrlState[] = [
      DEFAULT_STATE,
      {
        filters: { models: ['llama-3-70b'], statuses: [500], from: null, to: '2026-10-27' },
        sort: { field: 'costUsd', direction: 'asc' },
        page: 7,
      },
      {
        filters: { models: [], statuses: [200, 429], from: '2026-09-28', to: null },
        sort: { field: 'timestamp', direction: 'asc' },
        page: 1,
      },
    ];
    for (const state of states) {
      const query = toSearchString(serializeUrlState(state));
      expect(parse(query.replace(/^\?/, ''))).toEqual(state);
    }
  });
});
