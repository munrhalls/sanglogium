// Proves chunk 1 step 1 of docs/features/filters-sorting-design.md: which fields the
// picklist offers. A small fake field list in the real schema's shape is fed to
// filterFieldPaths; the returned paths are compared to a hand-written expected array.
// Human-run only, one file at a time:
// cd /home/jan/work/wt-picklist-eligible && node --experimental-strip-types --import ./tools/alias-loader.mjs --test tests/product-filtering/backend/filterFieldPaths.test.ts

import test from 'node:test';
import assert from 'node:assert/strict';

import { filterFieldPaths } from '@/features/product-filtering/schema/filterFieldPaths';

test('the picklist offers only fields that can become a control', () => {
  const fields: any[] = [
    { name: 'shell', type: 'string' },
    { name: 'tags', type: 'array', of: [{ type: 'string' }] },
    { name: 'legs', type: 'number' },
    { name: 'glow', type: 'boolean' },
    {
      name: 'tilt',
      type: 'object',
      fields: [
        { name: 'min', type: 'number' },
        { name: 'max', type: 'number' },
      ],
    },
    {
      name: 'sourcing',
      type: 'array',
      of: [
        {
          name: 'citation',
          type: 'object',
          fields: [{ name: 'field', type: 'string' }],
        },
      ],
    },
    { name: 'price', type: 'number' },
    { name: 'brand', type: 'array', of: [{ type: 'string' }] },
    { name: 'inStock', type: 'boolean' },
    { name: 'shell', type: 'string' },
  ];

  assert.deepStrictEqual(filterFieldPaths(fields), ['shell', 'tags', 'legs', 'glow', 'tilt.min', 'tilt.max']);
});
