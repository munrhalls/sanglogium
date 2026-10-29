// Behaviour law for chunk 3 of docs/features/filters-sorting-design.md:
// URL query + labelled controls -> filter state, on a facet set in chunk 1's output format (alien content),
// strict equality with a hand-written expected state.
// Human-run only, one file at a time:
// node --experimental-strip-types --import ./tools/alias-loader.mjs --test tests/product-filtering/backend/urlToFilterState.test.ts

import test from 'node:test';
import assert from 'node:assert/strict';

import { loadFacetFilterState } from '@/features/product-filtering/url/filterSortParams';
import { sanitizeFilterState } from '@/features/product-filtering/core/rules/sanitizeFilterState';
import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';
import type { FilterQuery } from '@/features/product-filtering/core/types/filterTypes';

// One control of each kind; `finish` keeps the spelling chunk 1 kept for two case-only spellings.
const facetSet: FacetSet = {
  groups: [
    { id: 'commercial', label: '' },
    { id: 'more', label: 'More filters' },
  ],
  facets: [
    { id: 'brand', attribute: 'brand', label: 'Brand', group: 'commercial', control: 'checkbox' },
    { id: 'inStock', attribute: 'inStock', label: 'In Stock Only', group: 'commercial', control: 'boolean' },
    {
      id: 'shell',
      attribute: 'shell',
      label: 'Shell',
      group: 'more',
      control: 'checkbox',
      options: [
        { value: 'hard-blue', label: 'Hard Blue' },
        { value: 'soft-red', label: 'Soft Red' },
      ],
    },
    { id: 'glow', attribute: 'glow', label: 'Glow', group: 'more', control: 'boolean' },
    { id: 'legs', attribute: 'legs', label: 'Legs', group: 'more', control: 'range', min: 4, max: 8 },
    {
      id: 'finish',
      attribute: 'finish',
      label: 'Finish',
      group: 'more',
      control: 'checkbox',
      options: [
        { value: 'Matte-Gold', label: 'Matte Gold' },
        { value: 'satin-ash', label: 'Satin Ash' },
      ],
    },
  ],
  queryOnly: [{ id: 'wearingStyle', attribute: 'wearingStyle', control: 'checkbox', values: ['in-ear', 'over-ear'] }],
};

const stateOf = (query: FilterQuery) => sanitizeFilterState(loadFacetFilterState(query, facetSet), facetSet);

test('URL + labelled controls -> filter state', () => {
  // Nothing in the URL: every key at its default.
  assert.deepStrictEqual(stateOf({}), {
    sort: 'newest',
    minPrice: null,
    maxPrice: null,
    inStock: false,
    brand: [],
    shell: [],
    glow: false,
    legsMin: null,
    legsMax: null,
    finish: [],
    wearingStyle: [],
  });

  // Valid values: read as given. The brand names are not checked here (chunk 4 counts them).
  // `matte-gold` matches the option `Matte-Gold`.
  assert.deepStrictEqual(
    stateOf({
      sort: 'price-asc',
      minPrice: '100',
      maxPrice: '500',
      inStock: 'true',
      brand: 'acme,zed',
      shell: 'hard-blue,soft-red',
      glow: 'true',
      legsMin: '4.5',
      legsMax: '8',
      finish: 'matte-gold',
      wearingStyle: 'in-ear',
    }),
    {
      sort: 'price-asc',
      minPrice: 100,
      maxPrice: 500,
      inStock: true,
      brand: ['acme', 'zed'],
      shell: ['hard-blue', 'soft-red'],
      glow: true,
      legsMin: 4.5,
      legsMax: 8,
      finish: ['matte-gold'],
      wearingStyle: ['in-ear'],
    },
  );

  // Junk: a bad sort falls back to the default, a price that is not a whole number is none,
  // a checkbox value that matches no option is dropped, an unknown key is ignored.
  assert.deepStrictEqual(
    stateOf({
      sort: 'banana',
      minPrice: '12.5',
      maxPrice: 'abc',
      inStock: 'maybe',
      shell: 'hard-blue,nope',
      glow: 'x',
      legsMin: 'x',
      finish: 'nope',
      wearingStyle: 'banana',
      strange: '1',
    }),
    {
      sort: 'newest',
      minPrice: null,
      maxPrice: null,
      inStock: false,
      brand: [],
      shell: ['hard-blue'],
      glow: false,
      legsMin: null,
      legsMax: null,
      finish: [],
      wearingStyle: [],
    },
  );
});
