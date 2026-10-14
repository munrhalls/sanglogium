// ══════════════════════════════════════════════════════════════════
// CHECK 3.1 — every offered filter value matches ≥1 product in the slice.
// Offered = what the slice's sidebar lists: each checkbox facet's options,
// and the "on" state of each boolean toggle. A derived facet (brand) lists
// live values, so it cannot be dead; a range has no clickable values.
// Pass = "DEAD OPTIONS: 0".
// Run: node tests/filtering/check-3.1-dead-options.mjs <slice>
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
if (!root) { console.log('Usage: node tests/filtering/check-3.1-dead-options.mjs <slice>'); process.exit(1); }
const keys = new Set();
{ const s = [root]; while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } }

// ── STEP 2: The options the slice's sidebar offers ──────────────────
// IN:  the slice's own FACETS (what print-2.1 shows) + FILTER_FACETS for
//      each facet's filterAttributes key.
// OUT: OFFERED — one entry per clickable value: a checkbox option's
//      value, or "on" for a boolean toggle.
// TRUST: built from the offered facets themselves, so nothing the sidebar
//      does not list is counted (an unlisted vocab value cannot be "dead").
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
const { FACETS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);
const OFFERED = [];
for (const f of FACETS) {
  const attribute = FILTER_FACETS.find((x) => x.urlParam === f.id).attribute;
  if (f.control === 'boolean') OFFERED.push({ id: f.id, attribute, boolean: true, value: 'on' });
  else if (f.control === 'checkbox' && f.options !== 'derived')
    for (const o of f.options) OFFERED.push({ id: f.id, attribute, boolean: false, value: o.value });
}

// ── STEP 3: Per offered value, count the products a click returns ───
// IN:  keys + OFFERED.
// OUT: dead list — offered values whose click returns 0 products.
// TRUST: the predicate is the app's own (buildProductQuery.ts): checkbox
//      values lower-cased on both sides and matched against a scalar OR an
//      array field; a toggle is `== true`; inStock falls back to
//      stock - reservedStock exactly as the app does.
const dead = [];
for (const o of OFFERED) {
  const field = `filterAttributes.${o.attribute}`;
  const clause = o.id === 'inStock'
    ? 'coalesce(filterAttributes.inStock, stock - reservedStock > 0) == true'
    : o.boolean
      ? `${field} == true`
      : `(coalesce(lower(${field}), '') in $values || count(coalesce(${field}, [])[lower(@) in $values]) > 0)`;
  const n = await client.fetch(
    `count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && ${clause}])`,
    { keys: [...keys], values: [o.value.toLowerCase()] }
  );
  if (n === 0) dead.push(`${o.id}: '${o.value}' — 0 products`);
}

// ── STEP 4: Report ──────────────────────────────────────────────────
// TRUST: "checked" is printed, so a pass cannot be an empty scan.
console.log(`checked: ${OFFERED.length} offered values across ${new Set(OFFERED.map((o) => o.id)).size} facets in ${process.argv[2]}`);
console.log(dead.length ? dead.join('\n') : 'clean');
console.log(`\nDEAD OPTIONS: ${dead.length}`);
