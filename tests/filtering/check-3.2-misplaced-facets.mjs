// ══════════════════════════════════════════════════════════════════
// CHECK 3.2 — no option appears in a slice whose products cannot carry it.
// "Cannot carry" is tested two independent ways for every offered facet:
//   schema: the facet's filterAttributes field is declared for this slice
//           (its `categories` include the slice or '*');
//   data:   at least one product in the slice carries the attribute.
// Pass = "MISPLACED: 0".
// Run: node tests/filtering/check-3.2-misplaced-facets.mjs <slice>
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import '../../tools/laws-loader.mjs';
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: Slice → location keys (same unroll as mission 01) ───────
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const root = index.slugToIdMap[process.argv[2]];
if (!root) { console.log('Usage: node tests/filtering/check-3.2-misplaced-facets.mjs <slice>'); process.exit(1); }
const keys = new Set();
{ const s = [root]; while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } }

// ── STEP 2: Facets the slice's sidebar offers + the schema's fields ──
// IN:  the slice's own FACETS (what print-2.1 shows), FILTER_FACETS for
//      attribute paths, the schema's four field-array modules.
// OUT: OFFERED — each facet with its filterAttributes path and the
//      schema field (with its `categories`) behind it.
// TRUST: both lists are the real modules (same loading as check 0.1;
//      `sanity`'s defineArrayMember is the only stub, an identity function).
registerHooks({
  resolve: (spec, ctx, next) => spec === 'sanity'
    ? { url: 'data:text/javascript,export const defineArrayMember=(x)=>x;', shortCircuit: true }
    : next(spec, ctx),
});
const DIR = '../../features/products/schema/productFilterAttributes/';
const fields = [
  ...(await import(DIR + 'shared.ts')).sharedFields,
  ...(await import(DIR + 'headphones.ts')).headphonesFields,
  ...(await import(DIR + 'audioElectronics.ts')).audioElectronicsFields,
  ...(await import(DIR + 'accessories.ts')).accessoriesFields,
];
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
const { FACETS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);
const OFFERED = FACETS.map((f) => {
  const attribute = FILTER_FACETS.find((x) => x.urlParam === f.id).attribute;
  return { id: f.id, attribute, field: fields.find((x) => x.name === attribute.split('.')[0]) };
});

// ── STEP 3: Test each offered facet both ways ───────────────────────
// IN:  keys + OFFERED.
// OUT: misplaced list; one status line per facet (schema verdict, and how
//      many slice products carry the attribute).
// TRUST: schema verdict = membership of the slice (or '*') in the field's
//      declared categories — an editor cannot enter the field for a
//      product outside them. Data verdict = `defined()` on the path the
//      query engine reads (inStock may fall back to stock, as the app does).
const misplaced = [];
const total = await client.fetch(`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0])`, { keys: [...keys] });
for (const f of OFFERED) {
  const schemaOk = !!f.field && (f.field.categories.includes('*') || f.field.categories.includes(process.argv[2]));
  const defined = f.id === 'inStock' ? `(defined(filterAttributes.inStock) || defined(stock))` : `defined(filterAttributes.${f.attribute})`;
  const n = await client.fetch(
    `count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && ${defined}])`,
    { keys: [...keys] }
  );
  const bad = !schemaOk || n === 0;
  if (bad) misplaced.push(`${f.id} (${f.attribute}) — ${!schemaOk ? `schema field not declared for ${process.argv[2]}` : ''}${!schemaOk && n === 0 ? '; ' : ''}${n === 0 ? 'absent on all products' : ''}`);
  console.log(`${bad ? '✗' : ' '} ${f.id.padEnd(26)} schema ${schemaOk ? 'ok' : 'NO'} | carried by ${n}/${total}`);
}

// ── STEP 4: Report ──────────────────────────────────────────────────
console.log(`\nscanned: ${OFFERED.length} offered facets in ${process.argv[2]}`);
console.log(misplaced.length ? misplaced.join('\n') : 'clean');
console.log(`MISPLACED: ${misplaced.length}`);
