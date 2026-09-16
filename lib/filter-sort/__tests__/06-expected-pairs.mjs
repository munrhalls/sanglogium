// sang-logium-ajf, step 6 — one proven expected ID-set per representative
// filter-option PAIR.
//
// Why "representative" rather than every possible pair: buildProductQuery.ts
// (read directly, in full, this session) builds its predicate as a straight
// AND of independent per-facet clauses -- one `parts.push(...)` per facet,
// no facet's clause branches on another facet's value anywhere in that file.
// Given that structural fact, the only real combinatorial risk pairwise
// testing needs to cover is "do the four clause SHAPES (boolean-equals,
// enum-in-list, multi-array-overlap, range-gte/lte) still each produce a
// correct AND when combined with each other" -- not every one of the ~300
// facet x facet combinations, which would all exercise the same four shapes
// repeatedly. This tests all 10 shape-pair combinations once each
// (boolean+boolean, boolean+enum, boolean+multi, boolean+range, enum+enum,
// enum+multi, enum+range, multi+multi, multi+range, range+range), using real
// observed values so every case is grounded in live data, not invented.
//
// Run: node lib/filter-sort/__tests__/06-expected-pairs.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { FACET_DEFS, runFilter } from './03-oracle-predicate.mjs';

const inventory = JSON.parse(
  readFileSync(new URL('./data/headphones-inventory.json', import.meta.url), 'utf8'),
);

function modeValue(facetId, kind) {
  const counts = new Map();
  for (const p of inventory) {
    const raw = p[facetId];
    const values = kind === 'multi' ? (Array.isArray(raw) ? raw : raw != null ? [raw] : []) : raw != null ? [raw] : [];
    for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  }
  let best = null, bestCount = -1;
  for (const [v, c] of counts) if (c > bestCount) { best = v; bestCount = c; }
  return best;
}

function medianValue(facetId) {
  const values = inventory.map((p) => p[facetId]).filter((v) => typeof v === 'number').sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}

// Two concrete facets chosen per shape, distinct where a shape needs a pair
// with itself (boolean+boolean, multi+multi, range+range).
const boolA = 'microphone';
const boolB = 'foldable';
const enumA = 'connectivity';
const enumB = 'anc';
const multiA = 'driverType';
const multiB = 'wearingStyle';
const rangeA = 'priceCentsResolved';
const rangeB = 'impedanceOhms';

const rep = {
  [boolA]: true,
  [boolB]: true,
  [enumA]: modeValue(enumA, FACET_DEFS[enumA].kind),
  [enumB]: modeValue(enumB, FACET_DEFS[enumB].kind),
  [multiA]: modeValue(multiA, FACET_DEFS[multiA].kind),
  [multiB]: modeValue(multiB, FACET_DEFS[multiB].kind),
  [rangeA]: { min: medianValue(rangeA) },
  [rangeB]: { min: medianValue(rangeB) },
};

const pairs = [
  ['bool+bool', boolA, boolB],
  ['bool+enum', boolA, enumA],
  ['bool+multi', boolA, multiA],
  ['bool+range', boolA, rangeA],
  ['enum+enum', enumA, enumB],
  ['enum+multi', enumA, multiA],
  ['enum+range', enumA, rangeA],
  ['multi+multi', multiA, multiB],
  ['multi+range', multiA, rangeA],
  ['range+range', rangeA, rangeB],
];

const results = pairs.map(([shape, fA, fB]) => {
  const filterState = { [fA]: rep[fA], [fB]: rep[fB] };
  return {
    caseId: `${shape}: ${fA}=${JSON.stringify(rep[fA])} & ${fB}=${JSON.stringify(rep[fB])}`,
    shape,
    filterState,
    expectedIds: runFilter(inventory, filterState),
  };
});

writeFileSync(
  new URL('./data/expected-pairs.json', import.meta.url),
  JSON.stringify(results, null, 2),
);

console.log(`Computed ${results.length} representative pair expected sets (one per facet-shape combination).`);
for (const r of results) {
  console.log(`  ${r.caseId} -> ${r.expectedIds.length} products`);
}
console.log(`\nWrote lib/filter-sort/__tests__/data/expected-pairs.json`);
