// ══════════════════════════════════════════════════════════════════
// CHECK 3.3 — a filter group shows only where the slice has ≥2 distinct
// values. A "filter group" is one offered facet's control (checkbox group,
// toggle, slider); its sidebar section (FACET_GROUP) is thin when every
// facet in it is thin.
// Pass = "THIN GROUPS: 0" (each listed group is a defect or a stated
// dismissal).
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

// ── STEP 2: The slice's offered facets and sections ─────────────────
// IN:  the slice's own FACETS + FACET_GROUPS (what print-2.1 shows).
// OUT: FACETS, FACET_GROUPS.
// TRUST: the same definitions module the sidebar renders from.
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
const { FACETS, FACET_GROUPS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);

// ── STEP 3: Fetch the attribute bags for the slice ──────────────────
// IN:  keys. OUT: filterAttributes + stock per product.
// TRUST: same membership query as mission-01; the bag is the only thing
//      the filtering engine reads (stock only for the inStock fallback).
const products = await client.fetch(
  `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...1000]{ stock, reservedStock, filterAttributes }`,
  { keys: [...keys] }
);

// ── STEP 4: Distinct values per offered facet; thin facets and sections ─
// IN:  products + FACETS + FACET_GROUPS.
// OUT: per facet, the number of distinct live values (checkbox: values
//      lower-cased as the app counts them; toggle: true/false; slider:
//      numbers); thin = fewer than 2. A section is thin when all its
//      facets are.
// TRUST: a facet with <2 distinct values can never narrow a result.
//      inStock is derived as the app derives it (explicit value, else
//      stock - reservedStock > 0).
const get = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);
const distinct = new Map();
for (const f of FACETS) {
  const attribute = FILTER_FACETS.find((x) => x.urlParam === f.id).attribute;
  const seen = new Set();
  for (const p of products) {
    if (f.id === 'inStock') { seen.add(String(p.filterAttributes?.inStock ?? ((p.stock ?? 0) - (p.reservedStock ?? 0) > 0))); continue; }
    const v = get(p.filterAttributes, attribute);
    for (const x of Array.isArray(v) ? v : [v]) if (x != null) seen.add(String(x).toLowerCase());
  }
  distinct.set(f.id, seen);
}
const thin = [];
for (const f of FACETS) if (distinct.get(f.id).size < 2) thin.push(`facet ${f.id} (${f.control}) — ${distinct.get(f.id).size} distinct: [${[...distinct.get(f.id)].join(', ')}]`);
for (const g of FACET_GROUPS) {
  const members = FACETS.filter((f) => f.group === g.id);
  if (members.every((f) => distinct.get(f.id).size < 2)) thin.push(`section ${g.id} — all ${members.length} facets thin`);
}

// ── STEP 5: Report ──────────────────────────────────────────────────
// TRUST: counts are printed, so a pass cannot be an empty scan.
console.log(`scanned: ${FACETS.length} offered facets in ${FACET_GROUPS.length} sections over ${products.length} products in ${process.argv[2]}`);
console.log(thin.length ? thin.join('\n') : 'clean');
console.log(`\nTHIN GROUPS: ${thin.length}`);
