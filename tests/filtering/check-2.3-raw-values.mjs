// ══════════════════════════════════════════════════════════════════
// CHECK 2.3 — one real-world value = one option: no spelling variants,
// one casing style, one unit expression, accurate labels.
// This script makes NO hygiene judgment — it prints every distinct raw
// value the slice's products actually carry per filterable attribute,
// so a human reads the vocabulary the options must match.
// Run: node tests/filtering/check-2.3-raw-values.mjs <slice>
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: Resolve the slice to its location-key set ───────────────
// IN:  data/catalogue-index.json + slice slug.
// OUT: every location id in the slice (all descendants unrolled).
// TRUST: identical unroll to mission-01 checks — "in slice" means what
//      the storefront means.
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const root = index.slugToIdMap[process.argv[2]];
if (!root) { console.log('Usage: node tests/filtering/check-2.3-raw-values.mjs <slice>\n  slices: headphones, audio-electronics, accessories'); process.exit(1); }
const keys = new Set();
{ const s = [root]; while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } }

// ── STEP 2: Pick the attributes to inspect ──────────────────────────
// IN:  FILTER_FACETS entries applicable to this slice (categories
//      contains the slice slug, or '*' universal).
// OUT: attributes — the filterAttributes key paths the UI can filter on.
// TRUST: same applicability rule the app uses; range/boolean facets are
//      single-valued by type, so only enum/multi vocab is listed below.
const ATTRS = FILTER_FACETS.filter((f) =>
  (f.categories.includes('*') || f.categories.includes(process.argv[2])) &&
  f.type !== 'range' && f.type !== 'boolean'
).map((f) => ({ urlParam: f.urlParam, attribute: f.attribute }));

// ── STEP 3: Fetch raw filterAttributes for every product in slice ───
// IN:  keys. OUT: products' filterAttributes objects only.
// TRUST: fetch is keyed by the same catalogueLocationKeys membership as
//      mission-01; no projection beyond the attribute bag.
const products = await client.fetch(
  `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...1000]{ filterAttributes }`,
  { keys: [...keys] }
);

// ── STEP 4: Distinct raw values per attribute, printed for reading ──
// IN:  filterAttributes bags + ATTRS.
// OUT: per attribute, the sorted distinct values with product counts.
// TRUST: pure tally — values are printed verbatim (case, spelling kept)
//      so variants like "Open-Back" vs "open-back" are visible.
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
for (const { urlParam, attribute } of ATTRS) {
  const tally = new Map();
  for (const p of products) {
    const v = get(p.filterAttributes, attribute);
    for (const x of Array.isArray(v) ? v : [v]) {
      if (x == null) continue;
      tally.set(String(x), (tally.get(String(x)) ?? 0) + 1);
    }
  }
  const rows = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n── ${urlParam}  (${attribute}) — ${rows.length} distinct ──`);
  for (const [v, n] of rows) console.log(`  ${String(n).padStart(4)}  ${v}`);
  if (!rows.length) console.log('  (no product carries this attribute)');
}
console.log(`\n${products.length} products scanned in ${process.argv[2]}. Read each list: variants, casing, units, jargon.`);
