// Behaviour laws for the derive chunk: fake CMS documents (./fakeCms) -> shape -> derive,
// strict equality between the output and a hand-written expected, including option order.
// Human-run only, one file at a time: node --experimental-strip-types --import ./tools/alias-loader.mjs --test <this file>

import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveControlsAndOptions } from '@/features/product-filtering/core/rules/deriveControlsAndOptions';
import { shapeProductsForDerive } from '@/features/product-filtering/core/rules/shapeProductsForDerive';
import type { ControlsByCategory } from '@/features/product-filtering/core/types/controlsAndOptions';

test('derive products data -> controls and options', () => {
  const fakeCms = (name: string) =>
    JSON.parse(readFileSync(new URL(`./fakeCms/${name}.json`, import.meta.url), 'utf8'));

  const { products, picklist } = shapeProductsForDerive(
    ['apple', 'pear', 'mango', 'spinach'].map(fakeCms),
    fakeCms('picklist'),
  );

  const expected: ControlsByCategory = {
    fruit: {
      farm: { control: 'checkbox', options: ['sunny', 'hill'] },
      grown: { control: 'checkbox', options: ['organic', 'local', 'imported'] },
      price: { control: 'range', min: 3, max: 5 },
      size: { control: 'checkbox', options: ['small', 'large'] },
    },
    veg: {
      farm: { control: 'checkbox', options: ['hill'] },
      grown: { control: 'checkbox', options: ['organic'] },
      price: { control: 'range', min: 9, max: 9 },
    },
  };

  const result = deriveControlsAndOptions(products, picklist);
  console.log('deriveControlsAndOptions(products, picklist) =>');
  console.log(JSON.stringify(result, null, 2));

  assert.deepStrictEqual(result, expected);
});
