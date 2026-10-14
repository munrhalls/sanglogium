// ══════════════════════════════════════════════════════════════════
// CHECK 3.1 — every offered filter value matches ≥1 product in the slice.
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

// ── STEP 2: The closed vocabularies applicable to this slice ────────
// IN:  FILTER_FACETS. OUT: every facet whose categories include this
//      slice or '*', with a concrete closed valueVocab (placeholders
//      like '<brand-slug>' skipped — a placeholder vocab is derived
//      from live data, so dead-by-construction options can't exist).
// TRUST: same applicability rule the app uses (categories field).
const APPLICABLE = FILTER_FACETS.filter((f) =>
  (f.categories.includes('*') || f.categories.includes(process.argv[2])) &&
  f.type !== 'range' && // range vocab 'min'/'max' are bound markers, not clickable values
  !f.valueVocab.some((v) => v.startsWith('<'))
);

// ── STEP 3: Per offered value, count matching products ──────────────
// IN:  keys + one facet's attribute path under filterAttributes.
// OUT: dead list — offered values with 0 matching products.
// TRUST: the count uses array-contains semantics on the same
//      filterAttributes path buildProductQuery filters on — a value
//      counted 0 here can never be returned by a shopper's click.
const dead = [];
let checked = 0;
for (const f of APPLICABLE) {
  for (const raw of f.valueVocab) {
    // Boolean vocab is 'true'/'false' strings; the data holds real
    // booleans — cast before matching. Enum/multi stay string and match
    // scalar fields (==) and array fields (in) alike.
    const value = f.type === 'boolean' ? raw === 'true' : raw;
    // inStock mirrors buildProductQuery's own coalesce fallback — absent
    // filterAttributes.inStock still matches via stock - reservedStock.
    const clause = f.urlParam === 'inStock'
      ? `coalesce(filterAttributes.inStock, stock - reservedStock > 0) == $value`
      : f.type === 'boolean'
        ? `filterAttributes.${f.attribute} == $value`
        : `(filterAttributes.${f.attribute} == $value || $value in filterAttributes.${f.attribute})`;
    const n = await client.fetch(
      `count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && ${clause}])`,
      { keys: [...keys], value }
    );
    checked++;
    if (n === 0) dead.push(`${f.urlParam}: '${raw}' — 0 products`);
  }
}

// ── STEP 4: Report ──────────────────────────────────────────────────
// TRUST: "checked" is printed, so a pass cannot be an empty scan.
console.log(`checked: ${checked} offered values across ${APPLICABLE.length} facets in ${process.argv[2]}`);
console.log(dead.length ? dead.join('\n') : 'clean');
console.log(`\nDEAD OPTIONS: ${dead.length}`);
