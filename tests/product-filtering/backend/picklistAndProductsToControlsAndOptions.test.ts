// Behaviour law for chunk 1, steps 3-4 of docs/features/filters-sorting-design.md:
// buildFacetSet(products, picks) on fake products in the real format -> FacetSet,
// strict equality with a hand-written expected, including facet order.
// Human-run only, one file at a time:
// node --experimental-strip-types --import ./tools/alias-loader.mjs --test tests/product-filtering/backend/picklistAndProductsToControlsAndOptions.test.ts

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFacetSet } from '@/features/product-filtering/core/rules/buildFacetSet';
import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';
import type { RawProduct } from '@/features/product-filtering/core/types/filterTypes';

test('picklist + products data -> controls and options', () => {
  const products: RawProduct[] = [
    {
      _id: 'p1',
      filterAttributes: {
        shell: 'hard-blue',
        tags: ['zeta-9', 'alpha'],
        glow: true,
        legs: 4,
        span: [10, 30],
        tilt: { min: 1, max: 5 },
        empty: '',
        lone: 'q',
      },
    },
    {
      _id: 'p2',
      filterAttributes: {
        shell: 'soft-red',
        tags: ['alpha', 'dac-4k'],
        glow: false,
        legs: 8,
        span: [20],
        tilt: { min: 2, max: 9 },
        empty: [],
      },
    },
    {
      _id: 'p3',
      filterAttributes: {
        shell: 'hard-blue',
        legs: 6,
      },
    },
  ];

  const picks = [
    'shell',
    'tags',
    'glow',
    'legs',
    'span',
    'tilt.min',
    'tilt.max',
    'empty',
    'ghost',
    'shell',
    'price',
    'brand',
    'inStock',
  ];

  const expected: FacetSet = {
    groups: [
      { id: 'commercial', label: '' },
      { id: 'more', label: 'More filters' },
    ],
    facets: [
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
      {
        id: 'tags',
        attribute: 'tags',
        label: 'Tags',
        group: 'more',
        control: 'checkbox',
        options: [
          { value: 'alpha', label: 'Alpha' },
          { value: 'dac-4k', label: 'DAC 4k' },
          { value: 'zeta-9', label: 'Zeta 9' },
        ],
      },
      { id: 'glow', attribute: 'glow', label: 'Glow', group: 'more', control: 'boolean' },
      { id: 'legs', attribute: 'legs', label: 'Legs', group: 'more', control: 'range', min: 4, max: 8 },
      { id: 'span', attribute: 'span', label: 'Span', group: 'more', control: 'range', min: 10, max: 30 },
      { id: 'tiltMin', attribute: 'tilt.min', label: 'Tilt Min', group: 'more', control: 'range', min: 1, max: 2 },
      { id: 'tiltMax', attribute: 'tilt.max', label: 'Tilt Max', group: 'more', control: 'range', min: 5, max: 9 },
    ],
    queryOnly: [],
  };

  const result = buildFacetSet(products, picks);
  console.log('buildFacetSet(products, picks) =>');
  console.log(JSON.stringify(result, null, 2));

  assert.deepStrictEqual(result, expected);
});
