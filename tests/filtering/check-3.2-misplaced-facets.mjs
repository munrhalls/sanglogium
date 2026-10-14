// ══════════════════════════════════════════════════════════════════
// CHECK 3.2 — no option appears in a slice whose products cannot carry it.
// Pass = "MISPLACED: 0".
// Run: node tests/filtering/check-3.2-misplaced-facets.mjs <slice>
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
if (!root) { console.log('Usage: node tests/filtering/check-3.2-misplaced-facets.mjs <slice>'); process.exit(1); }
const keys = new Set();
{ const s = [root]; while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } }

// ── STEP 2: Facets the slice's sidebar offers ───────────────────────
// IN:  the slice's own FACETS + FILTER_FACETS for attribute paths.
// OUT: offered facets with their filterAttributes key.
// TRUST: the offered set is the slice's own definitions module — the
//      same array print-2.1 shows the human.
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
const { FACETS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);
const OFFERED = FACETS.map((f) => ({
  id: f.id,
  attribute: FILTER_FACETS.find((x) => x.urlParam === f.id)?.attribute,
})).filter((f) => f.attribute);

// ── STEP 3: Which offered attributes does NO slice product carry? ───
// IN:  keys + each offered attribute.
// OUT: misplaced list — an offered facet whose attribute is absent
//      (undefined) on every product in the slice.
// TRUST: "absent" is `!defined(...)` on the same path the query engine
//      reads — absence there means the facet can never match.
const misplaced = [];
for (const f of OFFERED) {
  const n = await client.fetch(
    `count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(filterAttributes.${f.attribute})])`,
    { keys: [...keys] }
  );
  if (n === 0) misplaced.push(`${f.id} (${f.attribute}) — absent on all products`);
}

// ── STEP 4: Report ──────────────────────────────────────────────────
console.log(`scanned: ${OFFERED.length} offered facets in ${process.argv[2]}`);
console.log(misplaced.length ? misplaced.join('\n') : 'clean');
console.log(`\nMISPLACED: ${misplaced.length}`);
