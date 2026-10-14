// ══════════════════════════════════════════════════════════════════
// CHECK 0.1 — the Sanity schema's own option list equals FILTER_FACETS.valueVocab.
// Prerequisite of 1.2: check 2.2 diffs the sidebar's options against
// valueVocab and calls that "the schema's vocabulary". It is only so if
// each schema field really carries that list — `vocabFor()` makes it so
// for most fields, but some schema fields hold a hand-typed copy.
// Pass = "SCHEMA ≠ VOCAB: 0".
// Run: node tests/filtering/check-0.1-schema-vocab.mjs
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import '../../tools/laws-loader.mjs';
import { registerHooks } from 'node:module';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: Load the schema's filterAttributes fields ───────────────
// IN:  the four field-array modules under
//      features/products/schema/productFilterAttributes/.
// OUT: `fields` — every field object of the Studio schema, by name.
// TRUST: the real modules, loaded as-is (index.ts spreads these very
//      arrays into the schema). The loader only lets node resolve their
//      extensionless imports; the one stub is `sanity`'s
//      defineArrayMember, which is the identity function at runtime.
registerHooks({
  resolve: (spec, ctx, next) => spec === 'sanity'
    ? { url: 'data:text/javascript,export const defineArrayMember=(x)=>x;', shortCircuit: true }
    : next(spec, ctx),
});
const DIR = '../../features/products/schema/productFilterAttributes/';
const { sharedFields } = await import(DIR + 'shared.ts');
const { headphonesFields } = await import(DIR + 'headphones.ts');
const { audioElectronicsFields } = await import(DIR + 'audioElectronics.ts');
const { accessoriesFields } = await import(DIR + 'accessories.ts');
const fields = [...sharedFields, ...headphonesFields, ...audioElectronicsFields, ...accessoriesFields];

// ── STEP 2: Pick the facets that have a closed list ─────────────────
// IN:  FILTER_FACETS.
// OUT: `closed` — enum/multi facets whose valueVocab is real values.
// TRUST: boolean/range facets carry no option list by type; a '<…>'
//      placeholder means "no closed list" (nothing to compare).
const closed = FILTER_FACETS.filter((f) =>
  (f.type === 'enum' || f.type === 'multi') && !f.valueVocab.some((v) => v.startsWith('<'))
);

// ── STEP 3: Compare each facet's schema list to its valueVocab ──────
// IN:  `closed` + `fields`.
// OUT: one line per facet — "ok" or the exact difference.
// TRUST: the list is read from the schema field itself (its own
//      options.list, or its array item's) — whether it came from
//      vocabFor() or was typed by hand does not matter. Exact-string
//      symmetric difference; a missing field or list is a mismatch.
const listOf = (f) => f.options?.list ?? f.of?.find((o) => o?.options?.list)?.options?.list;
let bad = 0;
for (const facet of closed) {
  const matches = fields.filter((f) => f.name === facet.attribute);
  const list = matches.length === 1 ? listOf(matches[0]) : undefined;
  let line;
  if (matches.length !== 1) line = `${matches.length} schema fields named "${facet.attribute}"`;
  else if (!list) line = `schema field "${facet.attribute}" has no option list`;
  else {
    const schema = new Set(list);
    const vocab = new Set(facet.valueVocab);
    const schemaOnly = [...schema].filter((v) => !vocab.has(v));
    const vocabOnly = [...vocab].filter((v) => !schema.has(v));
    if (schemaOnly.length || vocabOnly.length) line = `schema-only=[${schemaOnly}] vocab-only=[${vocabOnly}]`;
  }
  if (line) bad++;
  console.log(`${line ? '✗' : ' '} ${facet.urlParam.padEnd(26)} ${line ?? `ok (${facet.valueVocab.length})`}`);
}

// ── STEP 4: Report ──────────────────────────────────────────────────
// IN:  `closed.length`, `bad`. OUT: how many were compared + the count.
// TRUST: "compared" is printed so a pass cannot be an empty comparison.
console.log(`\ncompared: ${closed.length} closed-list facets`);
console.log(`SCHEMA ≠ VOCAB: ${bad}`);
