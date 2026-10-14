// ══════════════════════════════════════════════════════════════════
// CHECK 3.7 — zero unfilterable products: every product carries a real
// value for each offered facet RELEVANT to it. Pass = "GAPS: 0".
// Run: node tests/filtering/check-3.7-unfilterable.mjs <slice>
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
if (!root) { console.log('Usage: node tests/filtering/check-3.7-unfilterable.mjs <slice>'); process.exit(1); }
const keys = new Set();
{ const s = [root]; while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } }

// ── STEP 2: The relevance gates — which products each facet applies to ──
// IN:  the slice's offered FACETS + FILTER_FACETS + the schema's field
//      arrays (their `domain`/`domainField` gates).
// OUT: per offered facet, a gate: the products that must carry its
//      attribute. A facet whose schema field has a `domain` applies only
//      where the gate field's value is in it (accessories gate on
//      accessoryType, audio-electronics on deviceType); the three
//      headphones rules the schema states in prose are listed below;
//      every other facet applies to the whole slice.
// TRUST: gates come from the schema (the rules editors are held to in
//      Studio), not from this script's own opinion. The list is printed in
//      full — read each line. A product whose gate field is itself empty
//      cannot be placed in a gate; that gap shows on the gate field's row.
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
const PROSE_RULES = process.argv[2] === 'headphones' ? {
  bluetoothCodecs: { by: 'connectivity', not: ['wired'], why: 'schema: "Meaningful only when connectivity !== \'wired\'"' },
  batteryLifeHours: { by: 'connectivity', not: ['wired'], why: 'schema: "Both null for a wired-only product"' },
  cableLengthM: { by: 'connectivity', not: ['true-wireless'], why: 'schema: "Null when not applicable (e.g. true-wireless)"' },
} : {};
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
const { FACETS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);
const GATED = FACETS.map((f) => {
  const attribute = FILTER_FACETS.find((x) => x.urlParam === f.id).attribute;
  const top = attribute.split('.')[0];
  const field = fields.find((x) => x.name === top);
  const gate = field?.domain?.length
    ? { by: field.domainField ?? 'accessoryType', in: field.domain, why: 'schema domain' }
    : PROSE_RULES[top] ?? null;
  return { id: f.id, attribute, gate };
});
for (const g of GATED) console.log(`${g.id.padEnd(26)} applies to: ${g.gate ? `${g.gate.by} ${g.gate.in ? 'in [' + g.gate.in.join(', ') + ']' : 'not in [' + g.gate.not.join(', ') + ']'}  (${g.gate.why})` : 'whole slice'}`);

// ── STEP 3: Fetch products with the attributes needed ────────────────
// IN:  keys. OUT: name, stock and filterAttributes per product.
// TRUST: same membership query as mission 01.
const products = await client.fetch(
  `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...1000]{ name, stock, filterAttributes }`,
  { keys: [...keys] }
);

// ── STEP 4: Count products missing a value for each relevant facet ──
// IN:  products + GATED. OUT: per facet, the products inside its gate
//      that carry no value at all (null/absent; an empty list is a value).
// TRUST: inStock counts as carried when the attribute or stock exists,
//      as the app derives it. Everything else is `== null` on the exact
//      path the query engine reads — a product missing it can never be
//      returned by that facet's options.
const get = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);
const inGate = (p, gate) => {
  if (!gate) return true;
  const v = get(p.filterAttributes, gate.by);
  if (v == null) return false;
  const arr = Array.isArray(v) ? v : [v];
  return gate.in ? arr.some((x) => gate.in.includes(x)) : !arr.some((x) => gate.not.includes(x));
};
let gaps = 0; let factsWithGaps = 0;
console.log('');
for (const g of GATED) {
  const members = products.filter((p) => inGate(p, g.gate));
  const missing = members.filter((p) => g.id === 'inStock' ? p.filterAttributes?.inStock == null && p.stock == null : get(p.filterAttributes, g.attribute) == null);
  if (missing.length) { gaps += missing.length; factsWithGaps++; }
  console.log(`${missing.length ? '✗' : ' '} ${g.id.padEnd(26)} ${String(missing.length).padStart(3)}/${members.length} in gate lack '${g.attribute}'${missing.length && missing.length <= 8 ? ' — ' + missing.map((p) => p.name).join(' | ') : ''}`);
}

// ── STEP 5: Report ──────────────────────────────────────────────────
console.log(`\nfacets with gaps: ${factsWithGaps} of ${GATED.length}`);
console.log(`GAPS: ${gaps} (products in a facet's gate missing its attribute, ${process.argv[2]})`);
