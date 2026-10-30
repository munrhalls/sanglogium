// Behaviour law for chunk 4 of docs/features/filters-sorting-design.md:
// labelled controls + filter state -> counts and bounds (CatalogueFacets), on four fake products in the real
// format with alien content, strict equality with hand-written expected values.
// The facet set is chunk 3's, the states are in chunk 3's output format.
// Human-run only, one file at a time:
// node --experimental-strip-types --import ./tools/alias-loader.mjs --test tests/product-filtering/backend/countsAndBounds.test.ts

import test from 'node:test';
import assert from 'node:assert/strict';

import { computeCatalogueFacets } from '@/features/product-filtering/core/rules/facetCounts';
import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';
import type { ProductQueryState, RawProduct } from '@/features/product-filtering/core/types/filterTypes';

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

// Price is in cents. p1 is in stock by its stock fields (5 - 1), p2 is not (1 - 1), p3 is (1 - 0), p4 is (2 - 0).
// p4 has no brand document, so it has no brand.
const products: RawProduct[] = [
  {
    _id: 'p1',
    filterAttributes: { shell: 'hard-blue', glow: true, legs: 4, finish: 'Matte-Gold', wearingStyle: 'in-ear' },
    brandRef: { name: 'Acme Audio', slug: 'acme' },
    price: 10000,
    stock: 5,
    reservedStock: 1,
  },
  {
    _id: 'p2',
    filterAttributes: { shell: 'soft-red', glow: false, legs: 6, finish: 'matte-gold', wearingStyle: 'over-ear' },
    brandRef: { name: 'Acme Audio', slug: 'acme' },
    price: 20000,
    stock: 1,
    reservedStock: 1,
  },
  {
    _id: 'p3',
    filterAttributes: { shell: 'hard-blue', glow: true, legs: 8, finish: 'satin-ash' },
    brandRef: { name: 'Zed Works', slug: 'zed' },
    price: 30000,
    stock: 1,
    reservedStock: 0,
  },
  {
    _id: 'p4',
    filterAttributes: { finish: 'satin-ash' },
    brandRef: null,
    price: 40000,
    stock: 2,
    reservedStock: 0,
  },
];

const none: ProductQueryState = {
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
};

// What no choice cannot change: the bounds and the brand names, from all four products.
const bounds = {
  brandLabels: { acme: 'Acme Audio', zed: 'Zed Works' },
  ranges: { legs: { min: 4, max: 8 } },
  priceRange: { minPrice: 10000, maxPrice: 40000, prices: [10000, 20000, 30000, 40000] },
};

test('labelled controls + filter state -> counts and bounds', () => {
  // No choice: every product counts for its options.
  assert.deepStrictEqual(computeCatalogueFacets(products, none, facetSet), {
    groups: {
      brand: [
        { value: 'acme', label: 'Acme Audio', count: 2 },
        { value: 'zed', label: 'Zed Works', count: 1 },
      ],
      shell: [
        { value: 'hard-blue', label: 'Hard Blue', count: 2 },
        { value: 'soft-red', label: 'Soft Red', count: 1 },
      ],
      finish: [
        { value: 'Matte-Gold', label: 'Matte Gold', count: 2 },
        { value: 'satin-ash', label: 'Satin Ash', count: 2 },
      ],
    },
    booleans: { inStock: 3, glow: 2 },
    ...bounds,
    isDefaultState: true,
    facetSet,
    state: none,
  });

  // One choice (shell hard-blue): the other controls count what is left, the shell control still counts every product,
  // the bounds do not move.
  const oneChoice = { ...none, shell: ['hard-blue'] };
  assert.deepStrictEqual(computeCatalogueFacets(products, oneChoice, facetSet), {
    groups: {
      brand: [
        { value: 'acme', label: 'Acme Audio', count: 1 },
        { value: 'zed', label: 'Zed Works', count: 1 },
      ],
      shell: [
        { value: 'hard-blue', label: 'Hard Blue', count: 2 },
        { value: 'soft-red', label: 'Soft Red', count: 1 },
      ],
      finish: [
        { value: 'Matte-Gold', label: 'Matte Gold', count: 1 },
        { value: 'satin-ash', label: 'Satin Ash', count: 1 },
      ],
    },
    booleans: { inStock: 2, glow: 2 },
    ...bounds,
    isDefaultState: false,
    facetSet,
    state: oneChoice,
  });

  // Several choices (two brands, glow on, legs from 5, price up to 350 dollars): only p3 matches them all.
  // Each control leaves out its own choice: glow counts p2 and p3, and brand 'acme' stays listed at zero.
  const manyChoices = { ...none, brand: ['acme', 'zed'], glow: true, legsMin: 5, maxPrice: 350 };
  assert.deepStrictEqual(computeCatalogueFacets(products, manyChoices, facetSet), {
    groups: {
      brand: [
        { value: 'zed', label: 'Zed Works', count: 1 },
        { value: 'acme', label: 'Acme Audio', count: 0 },
      ],
      shell: [
        { value: 'hard-blue', label: 'Hard Blue', count: 1 },
        { value: 'soft-red', label: 'Soft Red', count: 0 },
      ],
      finish: [
        { value: 'satin-ash', label: 'Satin Ash', count: 1 },
        { value: 'Matte-Gold', label: 'Matte Gold', count: 0 },
      ],
    },
    booleans: { inStock: 1, glow: 1 },
    ...bounds,
    isDefaultState: false,
    facetSet,
    state: manyChoices,
  });
});
