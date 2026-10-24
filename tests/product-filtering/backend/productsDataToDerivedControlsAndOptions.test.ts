// Behaviour laws for deriveControlsAndOptions: strict equality between the
// function's output and a hand-written expected, including option order.
// Human-run only, one file at a time: node --experimental-strip-types --import ./tools/alias-loader.mjs --test <this file>

import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveControlsAndOptions } from '@/features/product-filtering/core/rules/deriveControlsAndOptions';
import type {
  ControlsByCategory,
  DerivableProduct,
} from '@/features/product-filtering/core/types/controlsAndOptions';

test('derive 1: products data -> controls + options', () => {
  const picklist = ['farm', 'grown', 'price'];

  const products: DerivableProduct[] = [
    {
      category: 'fruit',
      fields: {
        farm: { id: 'sunny', name: 'Sunny Farm' },
        grown: ['organic'],
        price: 3,
      },
    },
    {
      category: 'fruit',
      fields: {
        farm: { id: 'hill', name: 'Hill Farm' },
        grown: ['organic', 'local'],
        price: 5,
      },
    },
    {
      category: 'fruit',
      fields: {
        farm: { id: 'sunny', name: 'Sunny Farm' },
        grown: ['imported'],
        price: 4,
      },
    },
    {
      category: 'veg',
      fields: {
        farm: { id: 'hill', name: 'Hill Farm' },
        grown: ['organic'],
        price: 9,
      },
    },
  ];

  const expected: ControlsByCategory = {
    fruit: {
      farm: { control: 'checkbox', options: ['sunny', 'hill'] },
      grown: { control: 'checkbox', options: ['organic', 'local', 'imported'] },
      price: { control: 'range', min: 3, max: 5 },
    },
    veg: {
      farm: { control: 'checkbox', options: ['hill'] },
      grown: { control: 'checkbox', options: ['organic'] },
      price: { control: 'range', min: 9, max: 9 },
    },
  };

  assert.deepStrictEqual(deriveControlsAndOptions(products, picklist), expected);
});
