// ══════════════════════════════════════════════════════════════════
// CHECK 4.1 — single-option parity: for EVERY offered option value in
// the slice, the app's returned _id set equals the oracle's expected set.
// Pass = "SET DIFFS: 0".
// Run: node tests/filtering/check-4.1-single-parity.mjs <slice>
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { register } from 'node:module';
register('./ts-alias-hooks.mjs', import.meta.url);
import { client } from '../catalogue/sanity-client.mjs';
import { keysFor, fetchSliceProducts, applySelection } from './oracle.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';
const { buildProductQuery } = await import('../../features/product-filtering/adapters/sanity/buildProductQuery.ts');

const slice = process.argv[2];
if (!slice) { console.log('Usage: node tests/filtering/check-4.1-single-parity.mjs <slice>'); process.exit(1); }

// ── STEP 1: The offered values to prove ─────────────────────────────
// IN:  FILTER_FACETS applicable to the slice (its categories or '*').
// OUT: one selection per checkbox/enum value, and per boolean facet
//      (true). Ranges are item 2.2's check; placeholder vocabs skipped
//      — a derived vocab can't enumerate "offered" values here.
// TRUST: the loop IS the coverage — every offered value gets a line.
const CASES = [];
for (const f of FILTER_FACETS) {
  if (!f.categories.includes('*') && !f.categories.includes(slice)) continue;
  if (f.type === 'range' || f.valueVocab.some((v) => v.startsWith('<'))) continue;
  if (f.type === 'boolean') { CASES.push({ urlParam: f.urlParam, sel: true, label: `${f.urlParam}=true` }); continue; }
  for (const v of f.valueVocab) CASES.push({ urlParam: f.urlParam, sel: [v], label: `${f.urlParam}=${v}` });
}
console.log(`${CASES.length} single-option cases in ${slice}`);

// ── STEP 2: Both sides of each case ─────────────────────────────────
// IN:  slice products (oracle input) + each case's selection.
// OUT: per case, appIds = _id set from the app's own GROQ built by
//      buildProductQuery and executed against Sanity exactly as
//      getProductsByVfsKeys runs it; oracleIds = applySelection set.
// TRUST: the app side is the real query object the storefront uses —
//      no re-implementation. The oracle side is mission-04 group 1's
//      proven logic.
const products = await fetchSliceProducts(slice);
const keys = keysFor(slice);
const diffs = [];
for (const c of CASES) {
  const { whereClause, params } = buildProductQuery({ [c.urlParam]: c.sel });
  const appIds = new Set((await client.fetch(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0${whereClause}]{ _id }`,
    { keys, ...params }
  )).map((p) => p._id));
  const oracleIds = new Set(applySelection(products, { [c.urlParam]: c.sel }));
  const missing = [...oracleIds].filter((id) => !appIds.has(id));
  const extra = [...appIds].filter((id) => !oracleIds.has(id));
  if (missing.length || extra.length)
    diffs.push(`${c.label}: app=${appIds.size} oracle=${oracleIds.size} missing=[${missing}] extra=[${extra}]`);
}

// ── STEP 3: Report ──────────────────────────────────────────────────
// TRUST: every case ran (count printed); a diff line names the option
//      and shows both directions of the mismatch.
console.log(diffs.length ? diffs.join('\n') : 'all sets identical');
console.log(`\nSET DIFFS: ${diffs.length}`);
