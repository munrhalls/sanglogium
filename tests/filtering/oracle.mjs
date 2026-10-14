// ══════════════════════════════════════════════════════════════════
// ORACLE — mission 04 group 1. The independent expected-subset
// generator. It must be provable BY READING ALONE: fetch raw products,
// apply a selection in memory, return the _id set. It imports nothing
// from buildProductQuery (the code under test) — only FILTER_FACETS,
// which 02-controls proved is the offered-set definition.
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone.
//
// Run: node tests/filtering/oracle.mjs <slice>
//   Prints: slice size, coverage vs offered facets, and three fixed
//   sample selections with the product names it picked.
// ══════════════════════════════════════════════════════════════════
import { register } from 'node:module';
register('./ts-alias-hooks.mjs', import.meta.url);
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: Slice membership — the mission-01 unroll ────────────────
// IN:  catalogue-index.json + slice slug. OUT: location-id set.
// TRUST: identical logic the already-merged mission-01 checks used.
export function keysFor(slug) {
  const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
  const out = new Set(); const s = [index.slugToIdMap[slug]];
  while (s.length) { const id = s.pop(); if (out.has(id)) continue; out.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); }
  return [...out];
}

// ── STEP 2: Raw products — _id, name, filterAttributes only ─────────
// IN:  keys. OUT: every product in the slice with its attribute bag.
// TRUST: the same membership clause the app queries with; the bag is
//      all the filtering engine ever reads.
export async function fetchSliceProducts(slug) {
  return client.fetch(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...1000]{ _id, name, stock, reservedStock, filterAttributes }`,
    { keys: keysFor(slug) }
  );
}

// ── STEP 3: applySelection — the whole oracle logic, 30 lines ───────
// IN:  products + a selection { urlParam: [values] | {min,max} | true }.
// OUT: the _id set of products that should be returned.
// RULES — read them, they are the entire claim:
//   • a value-list facet keeps a product iff the product's attribute
//     equals (==) or contains (in) ANY of the selected values,
//     compared lower-cased both sides           → OR within a group
//   • a boolean facet keeps it iff attribute == true
//   • a range facet keeps it iff min <= attr <= max (missing bound = open)
//   • every facet's test must hold at once      → AND across groups
// TRUST: these are the semantics 02 proved the options claim to have;
//      the matching is field-level on the same paths the app reads.
const get = (o, p) => p.split('.').reduce((x, k) => x?.[k], o);
export function applySelection(products, selection) {
  const facetByParam = new Map(FILTER_FACETS.map((f) => [f.urlParam, f]));
  return products.filter((p) => {
    for (const [urlParam, sel] of Object.entries(selection)) {
      const f = facetByParam.get(urlParam);
      if (!f) throw new Error(`selection uses unknown facet '${urlParam}'`);
      const attr = get(p.filterAttributes, f.attribute);
      if (f.type === 'boolean') {
        // inStock mirrors the app's documented fallback (buildProductQuery
        // S2): absent attribute means stock - reservedStock > 0.
        const eff = f.urlParam === 'inStock' && attr == null
          ? (p.stock ?? 0) - (p.reservedStock ?? 0) > 0
          : attr;
        if (sel === true && eff !== true) return false; continue;
      }
      if (f.type === 'range') {
        if (attr == null) return false;
        if (sel.min != null && attr < sel.min) return false;
        if (sel.max != null && attr > sel.max) return false;
        continue;
      }
      const selLc = sel.map((v) => String(v).toLowerCase());
      const vals = (Array.isArray(attr) ? attr : [attr]).filter((x) => x != null).map((x) => String(x).toLowerCase());
      if (!vals.some((v) => selLc.includes(v))) return false;
    }
    return true;
  }).map((p) => p._id);
}

// ── STEP 4 (self-check mode): sound + complete, printed for the human ──
// IN:  a slice slug. OUT: three lines of evidence — slice size vs the
//      mission-01 proven count; offered facets vs predicate coverage;
//      fixed sample selections with the names the oracle picked, so a
//      human can derive the same answers from check-2.3's raw lists.
// TRUST: the samples are FIXED (stated below) — no cherry-picking.
const PROVEN = { 'headphones': 174, 'audio-electronics': 221, 'accessories': 259 };
const SAMPLES = {
  'headphones': [{ soundSignature: ['Warm'] }, { acousticDesign: ['open-back'], connectivity: ['wired'] }, { driverType: ['planar-magnetic', 'dynamic'] }],
  'audio-electronics': [{ deviceType: ['dac'] }, { formFactor: ['portable'] }, { deviceType: ['dac'], formFactor: ['desktop'] }],
  'accessories': [{ accessoryType: ['cables-interconnects'] }, { cableFunction: ['headphone-cable'] }, { inStock: true }],
};

if (process.argv[1]?.endsWith('oracle.mjs')) {
  const slice = process.argv[2];
  if (!slice || !PROVEN[slice]) { console.log('Usage: node tests/filtering/oracle.mjs <slice>'); process.exit(1); }
  const products = await fetchSliceProducts(slice);
  console.log(`${slice}: ${products.length} products (mission-01 proven: ${PROVEN[slice]}) — ${products.length === PROVEN[slice] ? 'MATCH' : 'MISMATCH'}`);

  // coverage: every facet the slice offers must be evaluable — i.e. be in
  // FILTER_FACETS with an attribute path (the map oracle's step 3 reads).
  const MOD = { 'headphones': 'categories/headphones.ts', 'audio-electronics': 'categories/audioElectronics.ts', 'accessories': 'categories/accessories.ts' }[slice];
  const { FACETS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);
  const uncovered = FACETS.filter((f) => !FILTER_FACETS.find((x) => x.urlParam === f.id)?.attribute).map((f) => f.id);
  console.log(`coverage: ${FACETS.length} offered facets, ${uncovered.length} outside oracle reach${uncovered.length ? ': ' + uncovered.join(', ') : ''}`);

  for (const sel of SAMPLES[slice]) {
    const ids = applySelection(products, sel);
    console.log(`\nsample ${JSON.stringify(sel)} → ${ids.length} products`);
    for (const id of ids.slice(0, 20)) console.log(`  ${products.find((p) => p._id === id)?.name}`);
    if (ids.length > 20) console.log(`  …and ${ids.length - 20} more`);
  }
}
