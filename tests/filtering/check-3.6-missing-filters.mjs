// ══════════════════════════════════════════════════════════════════
// CHECK 3.6 — every attribute distinguishing ≥2 products in a slice is
// offered as a filter. Pass = "UNOFFERED: 0" (each listed key is a
// defect or a stated dismissal).
// Run: node tests/filtering/check-3.6-missing-filters.mjs <slice>
//
// Read this top to bottom. Each STEP is a black box.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: Slice → location keys (same unroll as mission 01) ───────
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const root = index.slugToIdMap[process.argv[2]];
if (!root) { console.log('Usage: node tests/filtering/check-3.6-missing-filters.mjs <slice>'); process.exit(1); }
const keys = new Set();
{ const s = [root]; while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } }

// ── STEP 2: All attribute keys present on slice products ────────────
// IN:  keys. OUT: every filterAttributes.* key that exists on any
//      product in the slice, with its distinct-value count.
// TRUST: the key list comes from the data itself, not from a hand
//      list — nothing on the products can hide from this scan.
const products = await client.fetch(
  `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...1000]{ filterAttributes }`,
  { keys: [...keys] }
);
const keyVals = new Map();
for (const p of products) {
  for (const [k, v] of Object.entries(p.filterAttributes ?? {})) {
    if (v == null || typeof v === 'object' && !Array.isArray(v)) {
      // object values (e.g. freqResponseHz{min,max}) are range data —
      // offerability of ranges is a design decision, count them by key.
      if (!keyVals.has(k)) keyVals.set(k, new Set());
      if (v != null) keyVals.get(k).add('<object>');
      continue;
    }
    if (!keyVals.has(k)) keyVals.set(k, new Set());
    for (const x of Array.isArray(v) ? v : [v]) keyVals.get(k).add(String(x));
  }
}

// ── STEP 3: Which distinguishing keys have no facet? ────────────────
// IN:  keyVals + the set of attributes FILTER_FACETS already offers.
// OUT: unoffered list — keys with ≥2 distinct values and no facet entry.
// TRUST: the offered set is FILTER_FACETS's own attribute paths; a key
//      missing there has no checkbox, range, or boolean behind it.
const offered = new Set(FILTER_FACETS.map((f) => f.attribute.split('.')[0]));
const unoffered = [];
for (const [k, vals] of keyVals) {
  if (vals.size >= 2 && !offered.has(k))
    unoffered.push(`${k} — ${vals.size} distinct, no filter offers it`);
}

// ── STEP 4: Report ──────────────────────────────────────────────────
console.log(`scanned: ${keyVals.size} attribute keys over ${products.length} products in ${process.argv[2]}`);
console.log(unoffered.length ? unoffered.join('\n') : 'clean');
console.log(`\nUNOFFERED: ${unoffered.length}`);
