// Behaviour laws for ./sanitizeFilterState: sanitizing must be idempotent —
// sanitize(sanitize(s)) always equals sanitize(s) — over representative
// states including unknown facet values, out-of-range prices and empty
// selections.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).

import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeFilterState } from './sanitizeFilterState';
import type { ProductQueryState } from './filterTypes';

const BASE: ProductQueryState = {
  sort: 'newest',
  minPrice: null,
  maxPrice: null,
  inStock: false,
};

const FIXTURES: { name: string; state: ProductQueryState; dataVocab?: Record<string, string[]> }[] = [
  {
    name: 'an unknown value in a closed-vocabulary facet',
    state: { ...BASE, wearingStyle: ['over-ear', 'not-a-style'] },
  },
  {
    name: 'an unknown value in a data-derived facet (brand) with dataVocab',
    state: { ...BASE, brand: ['acme', 'nobody'] },
    dataVocab: { brand: ['acme'] },
  },
  {
    name: 'a data-derived facet (brand) with no dataVocab entry',
    state: { ...BASE, brand: ['mystery'] },
  },
  {
    name: 'out-of-range prices and empty selections',
    state: { ...BASE, minPrice: -10, maxPrice: 999999, connectivity: [] },
  },
  {
    name: 'only valid selections',
    state: { ...BASE, anc: ['anc', 'passive'], acousticDesign: [] },
  },
];

for (const { name, state, dataVocab } of FIXTURES) {
  test(`sanitizing is idempotent for ${name}`, () => {
    const once = sanitizeFilterState(state, dataVocab);
    const twice = sanitizeFilterState(once, dataVocab);
    assert.deepEqual(twice, once);
  });
}

test('drops an unknown value in a closed-vocabulary facet, keeps valid ones', () => {
  const cleaned = sanitizeFilterState({
    ...BASE,
    wearingStyle: ['over-ear', 'not-a-style'],
  });
  assert.deepEqual(cleaned.wearingStyle, ['over-ear']);
});

test('drops a data-derived value not in the supplied dataVocab', () => {
  const cleaned = sanitizeFilterState(
    { ...BASE, brand: ['acme', 'nobody'] },
    { brand: ['acme'] },
  );
  assert.deepEqual(cleaned.brand, ['acme']);
});

test('leaves a data-derived facet untouched when no dataVocab is supplied', () => {
  const cleaned = sanitizeFilterState({ ...BASE, brand: ['mystery'] });
  assert.deepEqual(cleaned.brand, ['mystery']);
});

test('does not vet prices: out-of-range bounds pass through unchanged', () => {
  const cleaned = sanitizeFilterState({ ...BASE, minPrice: -10, maxPrice: 999999 });
  assert.equal(cleaned.minPrice, -10);
  assert.equal(cleaned.maxPrice, 999999);
});
