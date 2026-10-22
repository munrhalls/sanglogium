// Behaviour law for ./buildProductQuery: the database-query rule it emits
// (GROQ, run by Sanity for /products) and the plain-JS rule in
// core/rules/facetCounts.ts (productMatchesState, run by /search and the
// sidebar counts) must agree on which products match the same selection.
//
// Both rules are executed for real, not read as text: buildProductQuery's
// GROQ is run through groq-js (Sanity's own GROQ engine) against a tiny
// fixture, productMatchesState is called directly against the same fixture,
// and both are checked against a plain, human-written list of the ids that
// should match — written by reading the fixture below, before running
// anything.
//
// Human-run only, via `npm run laws` (or this file alone, see the command
// at the bottom of each test).

import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, parse } from 'groq-js';

import { buildProductQuery } from './buildProductQuery';
import { productMatchesState } from '@/features/product-filtering/core/rules/facetCounts';
import type { ProductQueryState, RawProduct } from '@/features/product-filtering/core/types/filterTypes';
import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';

const BASE_STATE: ProductQueryState = {
  sort: 'newest',
  minPrice: null,
  maxPrice: null,
  inStock: false,
};

const checkbox = (id: string) => ({
  id,
  attribute: id,
  label: id,
  group: 'g',
  control: 'checkbox' as const,
});

const boolean = (id: string) => ({
  id,
  attribute: id,
  label: id,
  group: 'g',
  control: 'boolean' as const,
});

const range = (id: string) => ({
  id,
  attribute: id,
  label: id,
  group: 'g',
  control: 'range' as const,
});

// RawProduct.price is already-projected legacy price (fetchFacetProducts.ts
// aliases it from "price_data.unit_amount"). A raw Sanity document carries
// the un-aliased price_data.unit_amount instead, so the GROQ side needs that
// shape back to read the same value buildProductQuery's clause expects.
async function groqIds(state: ProductQueryState, facetSet: FacetSet, products: RawProduct[]): Promise<string[]> {
  const { whereClause, params } = buildProductQuery(state, facetSet);
  const tree = parse(`*[_type == "product"${whereClause}]._id`);
  const dataset = products.map(({ price, ...p }) => ({
    ...p,
    _type: 'product',
    ...(price != null ? { price_data: { unit_amount: price } } : {}),
  }));
  const value = await evaluate(tree, { dataset, params });
  return (await value.get()) as string[];
}

function jsIds(state: ProductQueryState, facetSet: FacetSet, products: RawProduct[]): string[] {
  return products.filter((p) => productMatchesState(p, state, facetSet)).map((p) => p._id);
}

// Run just this test:
//   node --experimental-strip-types --import ./tools/laws-loader.mjs --test --test-name-pattern="checkbox facet" features/product-filtering/adapters/sanity/buildProductQuery.laws.ts
test('checkbox facet: OR within the facet, case-insensitive, scalar or array storage, missing field excluded', async () => {
  // sang-logium-269: a 'multi' field is sometimes stored as a bare scalar on
  // one product and an array on another. Both must still match.
  const PRODUCTS: RawProduct[] = [
    { _id: 'p1', filterAttributes: { connectivity: 'Wireless' } },            // scalar, mixed case
    { _id: 'p2', filterAttributes: { connectivity: ['wired'] } },             // array, one value
    { _id: 'p3', filterAttributes: { connectivity: ['wireless', 'wired'] } }, // array, both values
    { _id: 'p4', filterAttributes: {} },                                     // no value at all
    { _id: 'p5', filterAttributes: { connectivity: 'bluetooth' } },           // scalar, unselected value
  ];
  const FACETS: FacetSet = { groups: [], facets: [checkbox('connectivity')], queryOnly: [] };
  const state = { ...BASE_STATE, connectivity: ['wireless', 'wired'] };

  // Read the five products above: p1 (Wireless -> wireless, selected), p2
  // (array has "wired"), p3 (array has both) match. p4 has no value, p5 has
  // "bluetooth" which is not selected: both excluded.
  const expected = ['p1', 'p2', 'p3'];

  assert.deepEqual((await groqIds(state, FACETS, PRODUCTS)).sort(), expected);
  assert.deepEqual(jsIds(state, FACETS, PRODUCTS).sort(), expected);
});

// Run just this test:
//   node --experimental-strip-types --import ./tools/laws-loader.mjs --test --test-name-pattern="two selected facets" features/product-filtering/adapters/sanity/buildProductQuery.laws.ts
test('two selected facets combine with AND, including a selection that matches nothing', async () => {
  const PRODUCTS: RawProduct[] = [
    { _id: 'p1', filterAttributes: { connectivity: 'wireless', soundSignature: 'neutral' } },
    { _id: 'p2', filterAttributes: { connectivity: 'wireless', soundSignature: 'bassy' } },
    { _id: 'p3', filterAttributes: { connectivity: 'wired', soundSignature: 'neutral' } },
  ];
  const FACETS: FacetSet = { groups: [], facets: [checkbox('connectivity'), checkbox('soundSignature')], queryOnly: [] };

  // Only p1 has both wireless AND neutral.
  const bothState = { ...BASE_STATE, connectivity: ['wireless'], soundSignature: ['neutral'] };
  assert.deepEqual((await groqIds(bothState, FACETS, PRODUCTS)).sort(), ['p1']);
  assert.deepEqual(jsIds(bothState, FACETS, PRODUCTS).sort(), ['p1']);

  // No product is both wired AND bassy.
  const noneState = { ...BASE_STATE, connectivity: ['wired'], soundSignature: ['bassy'] };
  assert.deepEqual((await groqIds(noneState, FACETS, PRODUCTS)).sort(), []);
  assert.deepEqual(jsIds(noneState, FACETS, PRODUCTS).sort(), []);
});

// Run just this test:
//   node --experimental-strip-types --import ./tools/laws-loader.mjs --test --test-name-pattern="boolean facet" features/product-filtering/adapters/sanity/buildProductQuery.laws.ts
test('boolean facet only filters when selected', async () => {
  const PRODUCTS: RawProduct[] = [
    { _id: 'p1', filterAttributes: { foldable: true } },
    { _id: 'p2', filterAttributes: { foldable: false } },
    { _id: 'p3', filterAttributes: {} },
  ];
  const FACETS: FacetSet = { groups: [], facets: [boolean('foldable')], queryOnly: [] };

  // Not selected: every product passes through.
  const off = { ...BASE_STATE, foldable: false };
  assert.deepEqual((await groqIds(off, FACETS, PRODUCTS)).sort(), ['p1', 'p2', 'p3']);
  assert.deepEqual(jsIds(off, FACETS, PRODUCTS).sort(), ['p1', 'p2', 'p3']);

  // Selected: only the product with foldable === true.
  const on = { ...BASE_STATE, foldable: true };
  assert.deepEqual((await groqIds(on, FACETS, PRODUCTS)).sort(), ['p1']);
  assert.deepEqual(jsIds(on, FACETS, PRODUCTS).sort(), ['p1']);
});

// Run just this test:
//   node --experimental-strip-types --import ./tools/laws-loader.mjs --test --test-name-pattern="range facet" features/product-filtering/adapters/sanity/buildProductQuery.laws.ts
test('range facet bounds are inclusive', async () => {
  const PRODUCTS: RawProduct[] = [
    { _id: 'p1', filterAttributes: { impedanceOhms: 32 } },  // at min
    { _id: 'p2', filterAttributes: { impedanceOhms: 64 } },  // inside
    { _id: 'p3', filterAttributes: { impedanceOhms: 300 } }, // at max
    { _id: 'p4', filterAttributes: { impedanceOhms: 301 } }, // just outside max
    { _id: 'p5', filterAttributes: { impedanceOhms: 31 } },  // just outside min
  ];
  const FACETS: FacetSet = { groups: [], facets: [range('impedance')], queryOnly: [] };
  const state = { ...BASE_STATE, impedanceMin: 32, impedanceMax: 300 };

  // 32 and 300 themselves must match (inclusive); 301 and 31 must not.
  const expected = ['p1', 'p2', 'p3'];

  assert.deepEqual((await groqIds(state, FACETS, PRODUCTS)).sort(), expected);
  assert.deepEqual(jsIds(state, FACETS, PRODUCTS).sort(), expected);
});

// Run just this test:
//   node --experimental-strip-types --import ./tools/laws-loader.mjs --test --test-name-pattern="price prefers" features/product-filtering/adapters/sanity/buildProductQuery.laws.ts
test('price prefers filterAttributes.price, falls back to price_data.unit_amount', async () => {
  const PRODUCTS: RawProduct[] = [
    { _id: 'p1', filterAttributes: { price: 5000 }, price: 9999 }, // migrated: filterAttributes wins over the stale legacy price
    { _id: 'p2', filterAttributes: {}, price: 5000 },              // not migrated: falls back to legacy price
    { _id: 'p3', filterAttributes: { price: 20000 }, price: 20000 },
  ];
  const FACETS: FacetSet = { groups: [], facets: [], queryOnly: [] };
  const state = { ...BASE_STATE, minPrice: 40, maxPrice: 60 }; // 4000-6000 cents

  // p1 (5000 via filterAttributes) and p2 (5000 via legacy fallback) are in
  // range; p3 (20000) is not.
  const expected = ['p1', 'p2'];

  assert.deepEqual((await groqIds(state, FACETS, PRODUCTS)).sort(), expected);
  assert.deepEqual(jsIds(state, FACETS, PRODUCTS).sort(), expected);
});

// Run just this test:
//   node --experimental-strip-types --import ./tools/laws-loader.mjs --test --test-name-pattern="inStock prefers" features/product-filtering/adapters/sanity/buildProductQuery.laws.ts
test('inStock prefers filterAttributes.inStock, falls back to stock minus reservedStock', async () => {
  const PRODUCTS: RawProduct[] = [
    { _id: 'p1', filterAttributes: { inStock: true }, stock: 0, reservedStock: 0 },  // migrated: flag wins over stale stock numbers
    { _id: 'p2', filterAttributes: {}, stock: 5, reservedStock: 2 },                  // not migrated: 5-2=3 > 0, in stock
    { _id: 'p3', filterAttributes: {}, stock: 5, reservedStock: 5 },                  // not migrated: 5-5=0, out of stock
    { _id: 'p4', filterAttributes: { inStock: false }, stock: 99, reservedStock: 0 }, // migrated: flag wins, false
  ];
  const FACETS: FacetSet = { groups: [], facets: [], queryOnly: [] };
  const state = { ...BASE_STATE, inStock: true };

  const expected = ['p1', 'p2'];

  assert.deepEqual((await groqIds(state, FACETS, PRODUCTS)).sort(), expected);
  assert.deepEqual(jsIds(state, FACETS, PRODUCTS).sort(), expected);
});
