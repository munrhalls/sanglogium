// ══════════════════════════════════════════════════════════════════
// CHECK — the listing (GROQ) and the sidebar counts (JS) must agree
// on which products match the same selection.
//
// The /products listing asks Sanity: buildProductQuery() emits a GROQ
// predicate and Sanity returns the products the end user sees.
// The sidebar counts never ask Sanity: productMatchesState() is a
// separate, hand-written JS predicate run over products fetched once.
// Same selection, two code paths — this check proves they return the
// same products, so a count can never silently disagree with the
// listing again.
//
// Run: node --experimental-strip-types --import ./tools/laws-loader.mjs tests/product-filtering/check-groq-matches-js.laws.ts
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// (The .laws.ts ending is what lets this file import runtime code —
// per docs/organizational-pattern.md the tooling plane may not, but a
// laws file may.)
// ══════════════════════════════════════════════════════════════════
import { evaluate, parse } from 'groq-js'; // Sanity's own GROQ engine (ships with next-sanity)

import { buildProductQuery } from '@/features/product-filtering/adapters/sanity/buildProductQuery';
import { productMatchesState } from '@/features/product-filtering/core/rules/facetCounts';

// ── STEP 1: The cases ──────────────────────────────────────────────
// IN:  nothing — each case below is a tiny product list written by hand,
//      a selection (state + facet set), and EXPECTED: the ids a human
//      gets by reading the product list with their eyes.
// OUT: `cases`, one entry per situation the two matchers must agree on.
// TRUST: EXPECTED is written before any code runs, by reading the
//      products — so neither matcher can leak into the answer. If both
//      matchers agree with each other but both are wrong, EXPECTED
//      still catches them.

// The selection fields every case shares: newest sort, no price
// bounds, inStock filter off.
const BASE = { sort: 'newest', minPrice: null, maxPrice: null, inStock: false };

// Facet shapes the way buildFacetSet() hands them to both matchers:
// `attribute` is the key inside filterAttributes the facet reads.
const checkbox = (id, attribute = id) => ({ id, attribute, label: id, group: 'g', control: 'checkbox' });
const boolean = (id, attribute = id) => ({ id, attribute, label: id, group: 'g', control: 'boolean' });
const range = (id, attribute) => ({ id, attribute, label: id, group: 'g', control: 'range' });
const facetSet = (...facets) => ({ groups: [], facets, queryOnly: [] });

const cases = [
  {
    // A 'multi' field is stored as a bare scalar on one product and an
    // array on another (sang-logium-269). Both must match; matching is
    // OR within the facet and case-insensitive.
    name: 'checkbox facet: OR within the facet, case-insensitive, scalar or array storage',
    products: [
      { _id: 'p1', filterAttributes: { connectivity: 'Wireless' } },            // scalar, mixed case
      { _id: 'p2', filterAttributes: { connectivity: ['wired'] } },             // array, one value
      { _id: 'p3', filterAttributes: { connectivity: ['wireless', 'wired'] } }, // array, both values
      { _id: 'p4', filterAttributes: {} },                                      // no value at all
      { _id: 'p5', filterAttributes: { connectivity: 'bluetooth' } },           // scalar, unselected value
    ],
    // Selecting wireless+wired: p1 (Wireless→wireless), p2 (wired), p3
    // (both) match. p4 has nothing, p5's bluetooth is not selected.
    facetSet: facetSet(checkbox('connectivity')),
    state: { connectivity: ['wireless', 'wired'] },
    expected: ['p1', 'p2', 'p3'],
  },
  {
    name: 'two selected facets combine with AND, including a selection that matches nothing',
    products: [
      { _id: 'p1', filterAttributes: { connectivity: 'wireless', soundSignature: 'neutral' } },
      { _id: 'p2', filterAttributes: { connectivity: 'wireless', soundSignature: 'bassy' } },
      { _id: 'p3', filterAttributes: { connectivity: 'wired', soundSignature: 'neutral' } },
    ],
    facetSet: facetSet(checkbox('connectivity'), checkbox('soundSignature')),
    // wireless AND neutral → only p1. wired AND bassy → nobody.
    state: { connectivity: ['wireless'], soundSignature: ['neutral'] },
    expected: ['p1'],
    extra: {
      state: { connectivity: ['wired'], soundSignature: ['bassy'] },
      expected: [],
    },
  },
  {
    name: 'boolean facet only filters when selected',
    products: [
      { _id: 'p1', filterAttributes: { foldable: true } },
      { _id: 'p2', filterAttributes: { foldable: false } },
      { _id: 'p3', filterAttributes: {} },
    ],
    facetSet: facetSet(boolean('foldable')),
    // Off → all three pass through. On (extra) → only p1.
    state: { foldable: false },
    expected: ['p1', 'p2', 'p3'],
    extra: { state: { foldable: true }, expected: ['p1'] },
  },
  {
    name: 'range facet bounds are inclusive',
    products: [
      { _id: 'p1', filterAttributes: { impedanceOhms: 32 } },  // at min
      { _id: 'p2', filterAttributes: { impedanceOhms: 64 } },  // inside
      { _id: 'p3', filterAttributes: { impedanceOhms: 300 } }, // at max
      { _id: 'p4', filterAttributes: { impedanceOhms: 301 } }, // just outside max
      { _id: 'p5', filterAttributes: { impedanceOhms: 31 } },  // just outside min
    ],
    // Facet id 'impedance' reads attribute 'impedanceOhms'; the
    // selection arrives as impedanceMin/impedanceMax.
    facetSet: facetSet(range('impedance', 'impedanceOhms')),
    state: { impedanceMin: 32, impedanceMax: 300 },
    // 32 and 300 themselves must match (inclusive); 301 and 31 must not.
    expected: ['p1', 'p2', 'p3'],
  },
  {
    name: 'price prefers filterAttributes.price, falls back to legacy price',
    products: [
      { _id: 'p1', filterAttributes: { price: 5000 }, price: 9999 }, // migrated: filterAttributes wins over stale legacy price
      { _id: 'p2', filterAttributes: {}, price: 5000 },              // not migrated: falls back to legacy price
      { _id: 'p3', filterAttributes: { price: 20000 }, price: 20000 },
    ],
    facetSet: facetSet(),
    state: { minPrice: 40, maxPrice: 60 }, // dollars; both sides compare in cents
    // p1 (5000 via filterAttributes) and p2 (5000 via legacy fallback)
    // are in range; p3 (20000) is not.
    expected: ['p1', 'p2'],
  },
  {
    name: 'inStock prefers filterAttributes.inStock, falls back to stock minus reservedStock',
    products: [
      { _id: 'p1', filterAttributes: { inStock: true }, stock: 0, reservedStock: 0 },   // migrated: flag wins over stale stock numbers
      { _id: 'p2', filterAttributes: {}, stock: 5, reservedStock: 2 },                  // not migrated: 5-2=3 > 0, in stock
      { _id: 'p3', filterAttributes: {}, stock: 5, reservedStock: 5 },                  // not migrated: 5-5=0, out of stock
      { _id: 'p4', filterAttributes: { inStock: false }, stock: 99, reservedStock: 0 }, // migrated: flag wins, false
    ],
    facetSet: facetSet(),
    state: { inStock: true },
    expected: ['p1', 'p2'],
  },
];

// ── STEP 2: Ask the GROQ side ──────────────────────────────────────
// IN:  one case's products + selection.
// OUT: the ids the listing would show — produced by compiling
//      buildProductQuery()'s real whereClause into a GROQ filter and
//      running it through groq-js (the same engine family Sanity runs).
// TRUST: the query text is generated by production code, not
//      paraphrased here; groq-js evaluates it with no shortcuts. The
//      only adaptation: the fixtures carry the projected `price` field
//      the JS side reads, so it is mapped back to the raw document
//      shape (price_data.unit_amount) the GROQ clause coalesces with
//      filterAttributes.price — same value, the shape Sanity stores.
async function groqIds({ products, facetSet: facets, state }) {
  const { whereClause, params } = buildProductQuery({ ...BASE, ...state }, facets);
  const tree = parse(`*[_type == "product"${whereClause}]._id`);
  const dataset = products.map(({ price, ...p }) => ({
    ...p,
    _type: 'product',
    ...(price != null ? { price_data: { unit_amount: price } } : {}),
  }));
  return await (await evaluate(tree, { dataset, params })).get();
}

// ── STEP 3: Ask the JS side ────────────────────────────────────────
// IN:  the same products + selection.
// OUT: the ids productMatchesState() keeps — the predicate the sidebar
//      counts call, invoked exactly as production calls it.
// TRUST: no copy of the logic lives here; a behaviour change in
//      facetCounts.ts shows up in this output automatically.
function jsIds({ products, facetSet: facets, state }) {
  return products.filter((p) => productMatchesState(p, { ...BASE, ...state }, facets)).map((p) => p._id);
}

// ── STEP 4: Diff the three answers per case ────────────────────────
// IN:  EXPECTED (step 1), the GROQ ids (step 2), the JS ids (step 3).
// OUT: one line per selection — PASS when all three agree, FAIL with
//      the three lists side by side when they don't.
// TRUST: comparing against EXPECTED (not just GROQ-vs-JS) means the
//      check fails even if both code paths are wrong in the same way.
const sorted = (ids) => [...ids].sort();
const same = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
let failures = 0;

async function runSelection(c, state, expected, suffix = '') {
  const sel = { ...c, state };
  const groq = await groqIds(sel);
  const js = jsIds(sel);
  const ok = same(groq, expected) && same(js, expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.name}${suffix}`);
  if (!ok) {
    console.log(`      expected: [${sorted(expected)}]`);
    console.log(`      groq:     [${sorted(groq)}]`);
    console.log(`      js:       [${sorted(js)}]`);
  }
}

for (const c of cases) {
  await runSelection(c, c.state, c.expected);
  if (c.extra) await runSelection(c, c.extra.state, c.extra.expected, '  (second selection)');
}

console.log(failures ? `\n${failures} selection(s) disagree — the sidebar counts can lie about the listing.` : '\nAll selections agree.');
process.exit(failures ? 1 : 0);
