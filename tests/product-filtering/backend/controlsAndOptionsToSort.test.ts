// Behaviour laws for the sort chunk: fake controls (./fakeSortControls.json) + fake sort fields -> sort,
// strict equality between the output and a hand-written expected, including option order.
// Human-run only, one file at a time: node --experimental-strip-types --import ./tools/alias-loader.mjs --test <this file>

import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveSort } from '@/features/product-filtering/core/rules/deriveSort';
import type { ControlsByCategory } from '@/features/product-filtering/core/types/controlsAndOptions';
import type { SortByCategory } from '@/features/product-filtering/core/types/derivedSort';

test('derive controls and options -> sort', () => {
  const controls: ControlsByCategory = JSON.parse(
    readFileSync(new URL('./fakeSortControls.json', import.meta.url), 'utf8'),
  );
  const sortFields = ['size', 'price'];

  const expected: SortByCategory = {
    fruit: {
      options: [
        { value: 'size-asc', field: 'size', direction: 'asc', text: 'Size: A to Z' },
        { value: 'size-desc', field: 'size', direction: 'desc', text: 'Size: Z to A' },
        { value: 'price-asc', field: 'price', direction: 'asc', text: 'Price: Low to High' },
        { value: 'price-desc', field: 'price', direction: 'desc', text: 'Price: High to Low' },
      ],
      default: 'size-asc',
    },
    veg: {
      options: [
        { value: 'price-asc', field: 'price', direction: 'asc', text: 'Price: Low to High' },
        { value: 'price-desc', field: 'price', direction: 'desc', text: 'Price: High to Low' },
      ],
      default: 'price-asc',
    },
  };

  const result = deriveSort(controls, sortFields);
  console.log('deriveSort(controls, sortFields) =>');
  console.log(JSON.stringify(result, null, 2));

  assert.deepStrictEqual(result, expected);
});
