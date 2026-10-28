// Proves chunk 1 step 3 of docs/features/filters-sorting-design.md: the slice's own picks
// are used, and a failed picklist read means no picks. Fake ports feed getFilterFacets; the
// returned facet ids are compared to hand-written expected arrays.
// Human-run only, one file at a time:
// node --experimental-strip-types --import ./tools/alias-loader.mjs --test tests/product-filtering/backend/picklistPerSlice.test.ts

import test from 'node:test';
import assert from 'node:assert/strict';

import { getFilterFacets } from '@/features/product-filtering/queries/getFilterFacets';
import { SORT_DEFAULT } from '@/features/product-filtering/core/definitions/sortOptions';
import type { FacetPorts } from '@/features/product-filtering/core/ports';
import type { Picklist } from '@/features/product-filtering/core/types/picklist';
import type { ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';

const PICKLIST: Picklist = {
  headphones: ['shell'],
  'audio-electronics': ['legs'],
  accessories: [],
};

const ports = (picklist: Promise<Picklist> = Promise.resolve(PICKLIST)): FacetPorts => ({
  fetchProducts: () =>
    Promise.resolve([
      {
        _id: 'a',
        filterAttributes: { shell: 'hard-blue', legs: 4 },
        price: 100,
        stock: 1,
        reservedStock: 0,
      },
    ]),
  fetchPicklist: () => picklist,
  loadState: (): ProductQueryState => ({
    sort: SORT_DEFAULT,
    minPrice: null,
    maxPrice: null,
    inStock: false,
  }),
});

const facetIds = async (category?: 'headphones' | 'audio-electronics' | 'accessories', picklist?: Promise<Picklist>) => {
  const result = await getFilterFacets(ports(picklist), { keys: ['any'], query: {}, category });
  return result.facetSet.facets.map((facet) => facet.id);
};

test("the slice's own picks are used", async () => {
  assert.deepStrictEqual(await facetIds('audio-electronics'), ['brand', 'inStock', 'legs']);
});

test('no category reads the headphones list', async () => {
  assert.deepStrictEqual(await facetIds(), ['brand', 'inStock', 'shell']);
});

test('an empty list gives no picked controls', async () => {
  assert.deepStrictEqual(await facetIds('accessories'), ['brand', 'inStock']);
});

test('a failed picklist read gives no picks', async () => {
  assert.deepStrictEqual(
    await facetIds('audio-electronics', Promise.reject(new Error('picklist read failed'))),
    ['brand', 'inStock'],
  );
});
