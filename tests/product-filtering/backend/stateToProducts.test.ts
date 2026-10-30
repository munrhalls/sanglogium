// Behaviour law for chunk 5 of docs/features/filters-sorting-design.md:
// filter state + labelled controls -> the page's products and their total, on five fake products in the real
// format with alien content (a sixth sits outside the route), strict equality with hand-written expected ids.
// The real getProductsCount and getProductsChunk run; only the fetch differs: the GROQ goes to groq-js over the
// fake products instead of to Sanity. The facet set is chunk 3's and the states are in chunk 3's output format.
// Human-run only, one file at a time:
// node --experimental-strip-types --import ./tools/alias-loader.mjs --test tests/product-filtering/backend/stateToProducts.test.ts

import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { evaluate, parse } from 'groq-js';

import type { FacetSet } from '@/features/product-filtering/core/types/facetProjection';
import type { ProductQueryState } from '@/features/product-filtering/core/types/filterTypes';
import { pageWindow } from '@/features/products/core/rules/pageWindow';

const stub = (source: string) => ({ url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true });
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return stub('');
    if (specifier === 'next-sanity') return stub('export const groq = (s, ...v) => s.reduce((a, c, i) => a + c + (v[i] ?? ""), "");');
    if (specifier === '@/platform/sanity/client') {
      return stub('export const sanityFetch = ({ query, params }) => globalThis.__fetch(query, params ?? {});');
    }
    return nextResolve(specifier, context);
  },
});

const product = (
  id: string,
  createdAt: string,
  name: string,
  price: number,
  stock: number,
  reserved: number,
  filterAttributes: Record<string, unknown>,
  sortAttributes: Record<string, unknown> = {},
  displayPriority?: number,
) => ({
  _type: 'product',
  _id: id,
  _createdAt: createdAt,
  name,
  price_data: { unit_amount: price },
  stock,
  reservedStock: reserved,
  filterAttributes,
  sortAttributes,
  displayPriority,
  catalogueLocationKeys: ['k1'],
});

const brand = (id: string) => ({ _type: 'reference', _ref: id });

const brands = [
  { _type: 'brand', _id: 'b-acme', name: 'Acme Audio', slug: { current: 'acme' } },
  { _type: 'brand', _id: 'b-zed', name: 'Zed Works', slug: { current: 'zed' } },
];

const dataset = [
  ...brands,
  { ...product('p1', '2026-01-01', 'Beta Cup', 10000, 5, 1, { shell: 'hard-blue', glow: true, legs: 4, finish: 'Matte-Gold', wearingStyle: 'in-ear' }, { featuredPriority: 2, popularity: 5 }), brand: brand('b-acme') },
  // shell stored as a one-item list, the other products store a bare text
  { ...product('p2', '2026-02-01', 'alpha Dish', 20000, 1, 1, { shell: ['soft-red'], glow: false, legs: 6, finish: 'matte-gold', wearingStyle: 'over-ear' }, { popularity: 9 }, 7), brand: brand('b-acme') },
  { ...product('p3', '2026-03-01', 'Gamma Bowl', 30000, 1, 0, { shell: 'hard-blue', glow: true, legs: 8, finish: 'satin-ash' }, { featuredPriority: 2, popularity: 1 }), brand: brand('b-zed') },
  // finish stored as a list with a capital
  // no brand document, so no brand
  product('p4', '2026-04-01', 'delta Jar', 40000, 2, 0, { finish: ['Satin-Ash'] }),
  { ...product('p5', '2026-05-01', 'Epsilon Pan', 25000, 3, 0, { shell: 'soft-red', legs: 5 }, { popularity: 9 }), brand: brand('b-zed') },
  { ...product('p6', '2026-06-01', 'Zeta Lid', 5000, 9, 0, { shell: 'hard-blue' }), catalogueLocationKeys: ['k2'], brand: brand('b-acme') },
];

(globalThis as any).__fetch = async (query: string, params: Record<string, unknown>) => {
  const value = await evaluate(parse(query, { params }), { dataset, params });
  return value.get();
};

const { getProductsChunk, getProductsCount } = await import('@/features/products/adapters/sanity/getProductsByVfsKeys');

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

const keys = ['k1'];
const idsOf = async (state: ProductQueryState) =>
  (await getProductsChunk({ keys, offset: 0, limit: 24, state, facetSet })).map((p: any) => p._id);

test('each sort value orders the products', async () => {
  const expected = {
    newest: ['p5', 'p4', 'p3', 'p2', 'p1'],
    // p2 has no featured number, so its display priority 7 counts; p1 and p3 tie on 2 and p1 is more popular; p4 and p5 tie on 0 and p5 is more popular
    featured: ['p2', 'p1', 'p3', 'p5', 'p4'],
    // p2 and p5 tie on 9, the newer first
    'best-selling': ['p5', 'p2', 'p1', 'p3', 'p4'],
    'price-asc': ['p1', 'p2', 'p5', 'p3', 'p4'],
    'price-desc': ['p4', 'p3', 'p5', 'p2', 'p1'],
    // by lower-cased name: alpha, beta, delta, epsilon, gamma
    'alpha-asc': ['p2', 'p1', 'p4', 'p5', 'p3'],
    'alpha-desc': ['p3', 'p5', 'p4', 'p1', 'p2'],
  } as const;
  for (const [sort, ids] of Object.entries(expected)) {
    assert.deepStrictEqual(await idsOf({ ...none, sort: sort as ProductQueryState['sort'] }), ids, sort);
  }
});

test('each control narrows the products, and the total counts the same products', async () => {
  const cases: [string, Partial<ProductQueryState>, string[]][] = [
    ['no choice', {}, ['p5', 'p4', 'p3', 'p2', 'p1']],
    ['price from 150 dollars', { minPrice: 150 }, ['p5', 'p4', 'p3', 'p2']],
    ['price up to 250 dollars', { maxPrice: 250 }, ['p5', 'p2', 'p1']],
    ['price from 150 to 250 dollars', { minPrice: 150, maxPrice: 250 }, ['p5', 'p2']],
    // p2 is out by its stock fields (1 - 1)
    ['in stock', { inStock: true }, ['p5', 'p4', 'p3', 'p1']],
    ['checkbox, stored as text', { shell: ['hard-blue'] }, ['p3', 'p1']],
    ['checkbox, stored as text and as a list', { shell: ['soft-red'] }, ['p5', 'p2']],
    ['checkbox, two values', { shell: ['hard-blue', 'soft-red'] }, ['p5', 'p3', 'p2', 'p1']],
    ['checkbox, the data has capitals', { finish: ['matte-gold'] }, ['p2', 'p1']],
    ['checkbox, a list with capitals in the data', { finish: ['satin-ash'] }, ['p4', 'p3']],
    ['brand', { brand: ['zed'] }, ['p5', 'p3']],
    ['true/false control', { glow: true }, ['p3', 'p1']],
    ['range, from', { legsMin: 5 }, ['p5', 'p3', 'p2']],
    ['range, up to', { legsMax: 6 }, ['p5', 'p2', 'p1']],
    ['query-only control', { wearingStyle: ['in-ear'] }, ['p1']],
    // chunk 4's several choices
    ['several choices', { brand: ['acme', 'zed'], glow: true, legsMin: 5, maxPrice: 350 }, ['p3']],
    // a key that is no facet of this route narrows nothing
    ['an unknown key', { strange: ['x'] } as Partial<ProductQueryState>, ['p5', 'p4', 'p3', 'p2', 'p1']],
  ];
  for (const [name, change, ids] of cases) {
    const state = { ...none, ...change };
    assert.deepStrictEqual(await idsOf(state), ids, name);
    assert.strictEqual(await getProductsCount({ keys, state, facetSet }), ids.length, `${name}: total`);
  }
});

test('a window of the ordered products', async () => {
  const window = (offset: number, limit: number) =>
    getProductsChunk({ keys, offset, limit, state: none, facetSet }).then((list) => list.map((p: any) => p._id));
  assert.deepStrictEqual(await window(0, 2), ['p5', 'p4']);
  assert.deepStrictEqual(await window(2, 2), ['p3', 'p2']);
  assert.deepStrictEqual(await window(4, 2), ['p1']);
  assert.deepStrictEqual(await window(6, 2), []);
});

test('a page number -> the page shown and where its chunks start', () => {
  // 50 products at 24 a page: 3 pages; a chunk is 6 products
  assert.deepStrictEqual(pageWindow(50, 1, 24), { totalPages: 3, effectivePage: 1, chunkOffsets: [0, 6, 12, 18] });
  assert.deepStrictEqual(pageWindow(50, 2, 24), { totalPages: 3, effectivePage: 2, chunkOffsets: [24, 30, 36, 42] });
  assert.deepStrictEqual(pageWindow(50, 3, 24), { totalPages: 3, effectivePage: 3, chunkOffsets: [48, 54, 60, 66] });
  // past the end: the last page
  assert.deepStrictEqual(pageWindow(50, 9, 24), { totalPages: 3, effectivePage: 3, chunkOffsets: [48, 54, 60, 66] });
  // before the start, not a number, not a whole number: page 1
  for (const junk of [0, -4, NaN, 1.5]) {
    assert.deepStrictEqual(pageWindow(50, junk, 24), { totalPages: 3, effectivePage: 1, chunkOffsets: [0, 6, 12, 18] }, String(junk));
  }
  // nothing passes: page 1, no pages
  assert.deepStrictEqual(pageWindow(0, 5, 24), { totalPages: 0, effectivePage: 1, chunkOffsets: [0, 6, 12, 18] });
});
