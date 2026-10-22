// Behaviour laws for ./sanitizeFilterState: sanitizing must be idempotent —
// sanitize(sanitize(s)) always equals sanitize(s) — over representative
// states including unknown facet values, out-of-range prices and empty
// selections. The vocabulary comes from the facet set, so the fixture carries
// one: rendered facets vet by their options, query-only facets by their
// values, and facets carrying neither (brand) by the caller's dataVocab.
// Human-run only, via `npm run laws` (node:test, no dependency, no app boot).

import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeFilterState } from './sanitizeFilterState';
import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';
import type { ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';

const BASE: ProductQueryState = {
  sort: 'newest',
  minPrice: null,
  maxPrice: null,
  inStock: false,
};

const FACET_SET: FacetSet = {
  groups: [],
  facets: [
    {
      id: 'wearingStyle', attribute: 'wearingStyle', label: 'Wearing Style', group: 'type',
      control: 'checkbox',
      options: [
        { value: 'over-ear', label: 'Over-ear' },
        { value: 'in-ear', label: 'In-ear' },
      ],
    },
    { id: 'brand', attribute: 'brand', label: 'Brand', group: 'commercial', control: 'checkbox' },
    { id: 'inStock', attribute: 'inStock', label: 'In Stock Only', group: 'commercial', control: 'boolean' },
    { id: 'impedance', attribute: 'impedanceOhms', label: 'Impedance', group: 'sound', unit: 'Ω', control: 'range' },
  ],
  queryOnly: [
    { id: 'anc', attribute: 'anc', control: 'checkbox', values: ['anc', 'passive', 'none'] },
  ],
};

const FIXTURES: { name: string; state: ProductQueryState; dataVocab?: Record<string, string[]> }[] = [
  {
    name: 'an unknown value in a rendered facet',
    state: { ...BASE, wearingStyle: ['over-ear', 'not-a-style'] },
  },
  {
    name: 'an unknown value in a query-only facet',
    state: { ...BASE, anc: ['anc', 'not-a-mode'] },
  },
  {
    name: 'a value in a facet carrying no values (brand) with dataVocab',
    state: { ...BASE, brand: ['acme', 'nobody'] },
    dataVocab: { brand: ['acme'] },
  },
  {
    name: 'a facet carrying no values (brand) with no dataVocab entry',
    state: { ...BASE, brand: ['mystery'] },
  },
  {
    name: 'a param naming no facet in this set',
    state: { ...BASE, driverType: ['dynamic'] },
  },
  {
    name: 'out-of-range prices, a range bound and empty selections',
    state: { ...BASE, minPrice: -10, maxPrice: 999999, impedanceMin: 999, wearingStyle: [] },
  },
];

for (const { name, state, dataVocab } of FIXTURES) {
  test(`sanitizing is idempotent for ${name}`, () => {
    const once = sanitizeFilterState(state, FACET_SET, dataVocab);
    const twice = sanitizeFilterState(once, FACET_SET, dataVocab);
    assert.deepEqual(twice, once);
  });
}

test('drops an unknown value in a rendered facet, keeps valid ones', () => {
  const cleaned = sanitizeFilterState(
    { ...BASE, wearingStyle: ['over-ear', 'not-a-style'] },
    FACET_SET,
  );
  assert.deepEqual(cleaned.wearingStyle, ['over-ear']);
});

test('drops an unknown value in a query-only facet', () => {
  const cleaned = sanitizeFilterState(
    { ...BASE, anc: ['anc', 'not-a-mode'] },
    FACET_SET,
  );
  assert.deepEqual(cleaned.anc, ['anc']);
});

test('drops a data-derived value not in the supplied dataVocab', () => {
  const cleaned = sanitizeFilterState(
    { ...BASE, brand: ['acme', 'nobody'] },
    FACET_SET,
    { brand: ['acme'] },
  );
  assert.deepEqual(cleaned.brand, ['acme']);
});

test('leaves a facet carrying no values untouched when no dataVocab is supplied', () => {
  const cleaned = sanitizeFilterState({ ...BASE, brand: ['mystery'] }, FACET_SET);
  assert.deepEqual(cleaned.brand, ['mystery']);
});

test('leaves a param naming no facet in the set untouched — it is inert downstream, not deleted', () => {
  const cleaned = sanitizeFilterState({ ...BASE, driverType: ['dynamic'] }, FACET_SET);
  assert.deepEqual(cleaned.driverType, ['dynamic']);
});

test('does not vet prices or range bounds: they pass through unchanged', () => {
  const cleaned = sanitizeFilterState({ ...BASE, minPrice: -10, maxPrice: 999999, impedanceMin: 999 }, FACET_SET);
  assert.equal(cleaned.minPrice, -10);
  assert.equal(cleaned.maxPrice, 999999);
  assert.equal(cleaned.impedanceMin, 999);
});
