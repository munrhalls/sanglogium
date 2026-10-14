// ══════════════════════════════════════════════════════════════════
// CHECK 2.3 — one real-world value = one option: no spelling variants,
// one casing style, one unit expression, accurate labels.
// For every checkbox facet the slice OFFERS, it prints each distinct raw
// value the slice's products carry (verbatim, with counts). A row marked
// ✗ is a value the facet does not offer — a variant a shopper's click
// would never match. Unmarked rows are for a human to read (labels and
// units are read from print-2.1's output).
// Pass = "✗ ROWS: 0" and every printed list clean under human read.
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

// ── STEP 2: The attributes the slice's sidebar offers ───────────────
// IN:  the slice's own FACETS (what print-2.1 shows) + FILTER_FACETS.
// OUT: ATTRS — one entry per offered checkbox facet: the
//      filterAttributes key behind it, and its offered option values
//      (null for a derived facet such as brand).
// TRUST: built from the offered facets themselves, so every offered
//      option set is scanned and nothing the sidebar doesn't offer is.
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
const { FACETS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);
const ATTRS = FACETS.filter((f) => f.control === 'checkbox').map((f) => {
  const canon = FILTER_FACETS.find((x) => x.urlParam === f.id);
  if (!canon) throw new Error(`facet '${f.id}' has no FILTER_FACETS entry (check 2.2 reports it)`);
  return { id: f.id, attribute: canon.attribute, offered: f.options === 'derived' ? null : new Set(f.options.map((o) => o.value)) };
});

// ── STEP 3: Fetch raw filterAttributes for every product in slice ───
// IN:  keys. OUT: each product's name, its brand reference's slug, and
//      its filterAttributes bag.
// TRUST: fetch is keyed by the same catalogueLocationKeys membership as
//      mission-01; the brand slug comes from the product's own brand
//      reference — a source independent of the attribute bag.
const products = await client.fetch(
  `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...1000]{ name, "brandSlug": brand->slug.current, filterAttributes }`,
  { keys: [...keys] }
);

// ── STEP 4: Distinct raw values per attribute, printed for reading ──
// IN:  filterAttributes bags + ATTRS.
// OUT: per attribute, the distinct values with product counts, sorted
//      by count. A row is ✗ when its facet is closed and the value is
//      not an offered option.
// TRUST: pure tally — values are printed verbatim (case, spelling kept)
//      so variants like "Open-Back" vs "open-back" are visible; the
//      only judgement is set membership in the facet's own offered list.
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
let flagged = 0;
for (const { id, attribute, offered } of ATTRS) {
  const tally = new Map();
  for (const p of products) {
    const v = get(p.filterAttributes, attribute);
    for (const x of Array.isArray(v) ? v : [v]) {
      if (x == null) continue;
      tally.set(String(x), (tally.get(String(x)) ?? 0) + 1);
    }
  }
  const rows = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n── ${id}  (${attribute}) — ${rows.length} distinct ──`);
  for (const [v, n] of rows) {
    const bad = offered ? !offered.has(v) : false;
    if (bad) flagged++;
    console.log(`  ${bad ? '✗' : ' '} ${String(n).padStart(4)}  ${v}`);
  }
  if (!rows.length) console.log('  (no product carries this attribute)');

  // ── STEP 5: Derived facet (brand) — each product's value is its own brand ──
  // IN:  `products` (value + brand reference slug). OUT: ✗ line per product whose
  //      attribute is not exactly [its brand reference's slug].
  // TRUST: a derived facet's options ARE the raw values, so a product whose value
  //      differs from its own brand reference (case, shape, other slug) splits one
  //      brand into two options. The reference is the independent source.
  //      (A product with no value at all is mission 03's "missing", not a variant.)
  if (offered === null) {
    for (const p of products) {
      const v = get(p.filterAttributes, attribute);
      if (v == null) continue;
      const arr = Array.isArray(v) ? v : [v];
      if (arr.length !== 1 || arr[0] !== p.brandSlug) {
        flagged++;
        console.log(`  ✗ ${p.name}: ${JSON.stringify(v ?? null)} ≠ ["${p.brandSlug}"]`);
      }
    }
  }
}
console.log(`\n${products.length} products scanned in ${process.argv[2]}. ✗ ROWS: ${flagged}`);
console.log('Read each list: variants, casing, units, jargon.');
