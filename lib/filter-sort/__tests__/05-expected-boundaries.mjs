// sang-logium-ajf, step 5 — proven expected ID-sets for each range facet's
// edge values. Boundary points are the actual smallest/second-smallest and
// largest/second-largest values OBSERVED in the real inventory (not invented
// epsilons), so there is no floating-point-adjacent-value guessing: the
// "just inside" and "just outside" cases are real, distinct data points.
//
// Run: node lib/filter-sort/__tests__/05-expected-boundaries.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { FACET_DEFS, runFilter } from './03-oracle-predicate.mjs';

const inventory = JSON.parse(
  readFileSync(new URL('./data/headphones-inventory.json', import.meta.url), 'utf8'),
);

const rangeFacets = Object.entries(FACET_DEFS).filter(([, def]) => def.kind === 'range');
const results = [];

for (const [facetId] of rangeFacets) {
  const values = [...new Set(
    inventory.map((p) => p[facetId]).filter((v) => typeof v === 'number'),
  )].sort((a, b) => a - b);

  if (values.length < 2) {
    console.log(`SKIP ${facetId}: only ${values.length} distinct observed value(s), no meaningful boundary to test.`);
    continue;
  }

  const [smallest, secondSmallest] = values;
  const largest = values[values.length - 1];
  const secondLargest = values[values.length - 2];

  const boundaryCases = [
    { label: 'min-inclusive-at-smallest', filterState: { [facetId]: { min: smallest } } },
    { label: 'min-excludes-smallest', filterState: { [facetId]: { min: secondSmallest } } },
    { label: 'max-inclusive-at-largest', filterState: { [facetId]: { max: largest } } },
    { label: 'max-excludes-largest', filterState: { [facetId]: { max: secondLargest } } },
  ];

  for (const bc of boundaryCases) {
    results.push({
      caseId: `${facetId}:${bc.label}`,
      facetId,
      filterState: bc.filterState,
      expectedIds: runFilter(inventory, bc.filterState),
    });
  }
}

writeFileSync(
  new URL('./data/expected-boundaries.json', import.meta.url),
  JSON.stringify(results, null, 2),
);

console.log(`Computed ${results.length} boundary expected sets across ${rangeFacets.length} range facets.`);
for (const r of results) {
  console.log(`  ${r.caseId}: ${JSON.stringify(r.filterState)} -> ${r.expectedIds.length} products`);
}
console.log(`\nWrote lib/filter-sort/__tests__/data/expected-boundaries.json`);
