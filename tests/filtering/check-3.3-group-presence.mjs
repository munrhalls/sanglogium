// ══════════════════════════════════════════════════════════════════
// CHECK 3.3 — a filter group shows only where the slice has ≥2 distinct
// values. Pass = "THIN GROUPS: 0" (each listed group is a defect or a
// stated dismissal).
// Run: node tests/filtering/check-3.3-group-presence.mjs <slice>
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: Slice → location keys (same unroll as mission 01) ───────
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const root = index.slugToIdMap[process.argv[2]];
if (!root) { console.log('Usage: node tests/filtering/check-3.3-group-presence.mjs <slice>'); process.exit(1); }
const keys = new Set();
{ const s = [root]; while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } }

// ── STEP 2: Fetch the attribute bags for the slice ──────────────────
// IN:  keys. OUT: filterAttributes per product.
// TRUST: same membership query as mission-01; the bag is the only thing
//      the filtering engine reads.
const products = await client.fetch(
  `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...1000]{ filterAttributes }`,
  { keys: [...keys] }
);

// ── STEP 3: Distinct-value count per applicable facet ───────────────
// IN:  bags + FILTER_FACETS applicable to this slice.
// OUT: thin list — facets with <2 distinct live values in the slice.
// TRUST: the distinct set is tallied over raw values exactly as
//      computeCatalogueFacets counts them — a facet with <2 distinct
//      values can never narrow a result.
const get = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);
const thin = [];
let scanned = 0;
for (const f of FILTER_FACETS) {
  if (!f.categories.includes('*') && !f.categories.includes(process.argv[2])) continue;
  scanned++;
  const seen = new Set();
  for (const p of products) {
    const v = get(p.filterAttributes, f.attribute);
    for (const x of Array.isArray(v) ? v : [v]) if (x != null) seen.add(String(x));
  }
  if (seen.size < 2) thin.push(`${f.urlParam} (${f.facet}, ${f.type}) — ${seen.size} distinct: [${[...seen].join(', ')}]`);
}

// ── STEP 4: Report ──────────────────────────────────────────────────
console.log(`scanned: ${scanned} applicable facets over ${products.length} products in ${process.argv[2]}`);
console.log(thin.length ? thin.join('\n') : 'clean');
console.log(`\nTHIN GROUPS: ${thin.length}`);
