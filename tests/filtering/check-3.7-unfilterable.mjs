// ══════════════════════════════════════════════════════════════════
// CHECK 3.7 — zero unfilterable products: every product carries a real
// value for each facet RELEVANT to it. Pass = "GAPS: 0".
// Run: node tests/filtering/check-3.7-unfilterable.mjs <slice>
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
if (!root) { console.log('Usage: node tests/filtering/check-3.7-unfilterable.mjs <slice>'); process.exit(1); }
const keys = new Set();
{ const s = [root]; while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } }

// ── STEP 2: The relevance gates — which products each facet applies to ──
// IN:  the slice's offered FACETS (category defs) + FILTER_FACETS.
// OUT: per offered facet, a gate: which products must carry its
//      attribute. Gates mirror the domain rules in the definitions:
//      wireless facets (codec, anc, batteryLife) apply only to products
//      whose connectivity is not 'wired'; all other facets apply to
//      the whole slice.
// TRUST: the gate list is printed in full — a human reads and confirms
//      each rule before trusting the zero.
const WIRELESS = new Set(['codec', 'anc', 'batteryLife']);
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
const { FACETS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);
const GATED = FACETS.map((f) => {
  const canon = FILTER_FACETS.find((x) => x.urlParam === f.id);
  if (!canon) return null;
  const gate = WIRELESS.has(f.id)
    ? 'connectivity exists and != "wired"'
    : 'whole slice';
  return { id: f.id, attribute: canon.attribute, gate, wireless: WIRELESS.has(f.id) };
}).filter(Boolean);
for (const g of GATED) console.log(`${g.id.padEnd(20)} applies to: ${g.gate}`);

// ── STEP 3: Fetch products with the attributes needed ────────────────
// IN:  keys. OUT: name + filterAttributes (connectivity for gating).
// TRUST: same membership query as mission 01.
const products = await client.fetch(
  `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...1000]{ name, filterAttributes }`,
  { keys: [...keys] }
);

// ── STEP 4: Count products missing a value for each relevant facet ──
// IN:  products + GATED. OUT: per facet, products within its gate that
//      lack the attribute entirely (undefined). Lists product names
//      when the count is small so a human can sanity-check.
// TRUST: "missing" is !defined() on the exact attribute path the query
//      engine reads — a product missing it can never match a click.
const get = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);
let gaps = 0;
for (const g of GATED) {
  const inGate = products.filter((p) =>
    !g.wireless || (get(p.filterAttributes, 'connectivity') != null && get(p.filterAttributes, 'connectivity') !== 'wired')
  );
  const missing = inGate.filter((p) => get(p.filterAttributes, g.attribute) == null);
  if (missing.length) {
    gaps += missing.length;
    console.log(`\n✗ ${g.id}: ${missing.length}/${inGate.length} products in gate lack '${g.attribute}'`);
    for (const p of missing.slice(0, 15)) console.log(`    ${p.name}`);
    if (missing.length > 15) console.log(`    …and ${missing.length - 15} more`);
  }
}

// ── STEP 5: Report ──────────────────────────────────────────────────
console.log(`\nGAPS: ${gaps} (products in a facet's gate missing its attribute, ${process.argv[2]})`);
