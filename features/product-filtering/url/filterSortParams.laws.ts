// Behaviour laws for the filter/sort URL-param contract in ./filterSortParams.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SORT_DEFAULT,
  filterSortParsers,
  loadFilterSort,
  serializeFilterSort,
} from './filterSortParams';
import {
  FILTER_FACETS,
  isPlaceholderVocab,
} from '@/features/product-filtering/core/definitions/facetMap';

// One representative valid value per parser key, derived from the canonical
// facet map so every facet kind (boolean, enum, multi, range) and the sort
// are covered — including a real value for placeholder-vocab facets like
// `brand`, whose vocabulary is data-derived.
function representativeValue(key: string): unknown {
  if (key === 'sort') return 'price-asc';
  if (key === 'minPrice') return 25;
  if (key === 'maxPrice') return 250;
  const facet = FILTER_FACETS.find(
    (f) =>
      f.urlParam === key ||
      `${f.urlParam}Min` === key ||
      `${f.urlParam}Max` === key,
  );
  assert.ok(facet, `no facet found for parser key "${key}"`);
  if (facet.type === 'boolean') return true;
  if (facet.type === 'range') return key.endsWith('Min') ? 10 : 90;
  return [isPlaceholderVocab(facet.valueVocab) ? 'acme' : facet.valueVocab[0]];
}

test('every parser round-trips a valid value through serialize -> parse', (t) => {
  for (const key of Object.keys(filterSortParsers)) {
    const value = representativeValue(key);
    const query = serializeFilterSort({ [key]: value });
    const parsed = loadFilterSort(query);
    t.assert.deepEqual(
      parsed[key],
      value,
      `parser "${key}" round-trip: ${query} parsed back to ${JSON.stringify(parsed[key])}`,
    );
  }
});

test('parsing an empty query returns documented defaults and never throws', () => {
  const parsed = loadFilterSort('');
  assert.equal(parsed.sort, SORT_DEFAULT);
  assert.equal(parsed.minPrice, null);
  assert.equal(parsed.maxPrice, null);
  assert.equal(parsed.inStock, false);
  assert.deepEqual(parsed.brand, []);
});

test('an unknown sort key falls back to SORT_DEFAULT', () => {
  assert.equal(loadFilterSort('sort=bogus').sort, SORT_DEFAULT);
  assert.equal(loadFilterSort('sort=').sort, SORT_DEFAULT);
});

test('letters for numeric params parse to null, never throw', () => {
  const parsed = loadFilterSort('minPrice=abc&maxPrice=1.2.3');
  assert.equal(parsed.minPrice, null);
  assert.equal(parsed.maxPrice, null);
});

test('percent-garbage and junk values never throw and fall to null/default', () => {
  assert.doesNotThrow(() => loadFilterSort('minPrice=%25&sort=%ZZ%ZZ&inStock=banana'));
  const parsed = loadFilterSort('minPrice=%25&sort=%ZZ%ZZ&inStock=banana');
  assert.equal(parsed.minPrice, null);
  assert.equal(parsed.sort, SORT_DEFAULT);
  assert.equal(parsed.inStock, false);
});
