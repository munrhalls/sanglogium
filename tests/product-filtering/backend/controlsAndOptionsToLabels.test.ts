// Behaviour laws for the labels chunk: fake derived controls (./fakeDerivedControls.json) + a fake override table -> labels,
// strict equality between the output and a hand-written expected, including option order.
// Human-run only, one file at a time: node --experimental-strip-types --import ./tools/alias-loader.mjs --test <this file>

import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveLabels } from '@/features/product-filtering/core/rules/deriveLabels';
import type { ControlsByCategory } from '@/features/product-filtering/core/types/controlsAndOptions';
import type { LabelledControlsByCategory } from '@/features/product-filtering/core/types/labelledControls';

test('derive controls and options -> labels', () => {
  const controls: ControlsByCategory = JSON.parse(
    readFileSync(new URL('./fakeDerivedControls.json', import.meta.url), 'utf8'),
  );
  const overrides = { grown: { imported: 'Imported from abroad' } };

  const expected: LabelledControlsByCategory = {
    fruit: {
      farm: {
        control: 'checkbox',
        name: 'Farm',
        options: [
          { value: 'sunny', text: 'Sunny' },
          { value: 'hill', text: 'Hill' },
        ],
      },
      fresh: {
        control: 'checkbox',
        name: 'Fresh',
        options: [
          { value: true, text: 'True' },
          { value: false, text: 'False' },
        ],
      },
      grown: {
        control: 'checkbox',
        name: 'Grown',
        options: [
          { value: 'organic', text: 'Organic' },
          { value: 'local', text: 'Local' },
          { value: 'imported', text: 'Imported from abroad' },
        ],
      },
      grownIn: {
        control: 'checkbox',
        name: 'Grown In',
        options: [
          { value: 'open-field', text: 'Open Field' },
          { value: 'glasshouse', text: 'Glasshouse' },
        ],
      },
      price: { control: 'range', name: 'Price', min: 3, max: 5 },
      size: {
        control: 'checkbox',
        name: 'Size',
        options: [
          { value: 'small', text: 'Small' },
          { value: 'large', text: 'Large' },
        ],
      },
    },
    veg: {
      farm: { control: 'checkbox', name: 'Farm', options: [{ value: 'hill', text: 'Hill' }] },
      grown: { control: 'checkbox', name: 'Grown', options: [{ value: 'organic', text: 'Organic' }] },
      price: { control: 'range', name: 'Price', min: 9, max: 9 },
    },
  };

  const result = deriveLabels(controls, overrides);
  console.log('deriveLabels(controls, overrides) =>');
  console.log(JSON.stringify(result, null, 2));

  assert.deepStrictEqual(result, expected);
});
