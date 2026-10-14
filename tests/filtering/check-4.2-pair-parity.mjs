// ══════════════════════════════════════════════════════════════════
// CHECK 4.2 — pair parity: every offered pair of option values returns
// exactly the oracle's set. Within one facet the values OR; across two
// facets they AND. Pass = "SET DIFFS: 0".
// Run: node tests/filtering/check-4.2-pair-parity.mjs <slice>
//      (this fires one real query per pair — it is the proof run,
//      not a smoke test)
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
if (!slice) { console.log('Usage: node tests/filtering/check-4.2-pair-parity.mjs <slice>'); process.exit(1); }

// ── STEP 1: Every expressible pair ──────────────────────────────────
// IN:  closed-vocab enum/multi facets applicable to the slice.
// OUT: WITHIN — all 2-value combos inside one facet (OR).
//      ACROSS — all value×value combos of two different facets (AND).
// TRUST: the loops enumerate the full cross-product of what the sidebar
//      can express; the pair counts are printed so coverage is visible.
const FACETS = FILTER_FACETS.filter((f) =>
  (f.categories.includes('*') || f.categories.includes(slice)) &&
  f.type !== 'range' && f.type !== 'boolean' &&
  !f.valueVocab.some((v) => v.startsWith('<'))
);
const WITHIN = [], ACROSS = [];
for (const f of FACETS)
  for (let i = 0; i < f.valueVocab.length; i++)
    for (let j = i + 1; j < f.valueVocab.length; j++)
      WITHIN.push({ sel: { [f.urlParam]: [f.valueVocab[i], f.valueVocab[j]] }, label: `${f.urlParam}=${f.valueVocab[i]}|${f.valueVocab[j]}` });
for (let a = 0; a < FACETS.length; a++)
  for (let b = a + 1; b < FACETS.length; b++)
    for (const va of FACETS[a].valueVocab)
      for (const vb of FACETS[b].valueVocab)
        ACROSS.push({ sel: { [FACETS[a].urlParam]: [va], [FACETS[b].urlParam]: [vb] }, label: `${FACETS[a].urlParam}=${va} & ${FACETS[b].urlParam}=${vb}` });
console.log(`${WITHIN.length} within-group pairs, ${ACROSS.length} cross-group pairs (${WITHIN.length + ACROSS.length} queries) in ${slice}`);

// ── STEP 2: Run each pair against both sides ─────────────────────────
// IN:  slice products + keys + each pair's selection.
// OUT: diffs — pairs where the app's GROQ set ≠ oracle's set.
// TRUST: same wiring as check-4.1 — app side is buildProductQuery's
//      real output executed verbatim; oracle side is the proven logic.
const products = await fetchSliceProducts(slice);
const keys = keysFor(slice);
const diffs = [];
let ran = 0;
for (const c of [...WITHIN, ...ACROSS]) {
  const { whereClause, params } = buildProductQuery(c.sel);
  const appIds = new Set((await client.fetch(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0${whereClause}]{ _id }`,
    { keys, ...params }
  )).map((p) => p._id));
  const oracleIds = new Set(applySelection(products, c.sel));
  const missing = [...oracleIds].filter((id) => !appIds.has(id));
  const extra = [...appIds].filter((id) => !oracleIds.has(id));
  if (missing.length || extra.length)
    diffs.push(`${c.label}: app=${appIds.size} oracle=${oracleIds.size} missing=[${missing}] extra=[${extra}]`);
  if (++ran % 200 === 0) console.log(`  …${ran}/${WITHIN.length + ACROSS.length}`);
}

// ── STEP 3: Report ──────────────────────────────────────────────────
console.log(diffs.length ? diffs.join('\n') : 'all sets identical');
console.log(`\nSET DIFFS: ${diffs.length} over ${ran} pairs`);
