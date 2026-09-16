// sang-logium-ajf, step 4 — one proven expected ID-set per individual filter
// value, computed via the hand-written oracle (step 3) applied to exactly one
// facet at a time. Values are discovered from the real inventory dump itself
// (not from any hardcoded vocab list), so this only tests values that
// actually occur in live data.
//
// Run: node lib/filter-sort/__tests__/04-expected-singles.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { FACET_DEFS, runFilter } from './03-oracle-predicate.mjs';

const inventory = JSON.parse(
  readFileSync(new URL('./data/headphones-inventory.json', import.meta.url), 'utf8'),
);

const cases = [];

for (const [facetId, def] of Object.entries(FACET_DEFS)) {
  if (def.kind === 'range') continue; // boundaries handled in step 5

  if (def.kind === 'boolean') {
    cases.push({ facetId, value: true, filterState: { [facetId]: true } });
    continue;
  }

  const observed = new Set();
  for (const p of inventory) {
    const v = p[facetId];
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach((x) => observed.add(x));
    else observed.add(v);
  }
  for (const value of observed) {
    cases.push({ facetId, value, filterState: { [facetId]: value } });
  }
}

const results = cases.map((c) => ({
  caseId: `${c.facetId}=${c.value}`,
  facetId: c.facetId,
  value: c.value,
  filterState: c.filterState,
  expectedIds: runFilter(inventory, c.filterState),
}));

writeFileSync(
  new URL('./data/expected-singles.json', import.meta.url),
  JSON.stringify(results, null, 2),
);

console.log(`Computed ${results.length} single-value expected sets across ${Object.keys(FACET_DEFS).length - 6} non-range + 6 boolean facets.`);
for (const r of results) {
  console.log(`  ${r.caseId}: ${r.expectedIds.length} products`);
}
console.log(`\nWrote lib/filter-sort/__tests__/data/expected-singles.json`);
