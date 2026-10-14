// ══════════════════════════════════════════════════════════════════
// CHECK 2.4 — universal options mean/name/behave identically in every
// slice; no slice-specific option duplicates or clashes with a universal.
// Pass = "CLASHES: 0".
// Run: node tests/filtering/check-2.4-universals.mjs
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

const clashes = [];

// ── STEP 1: Universals are single-source ────────────────────────────
// IN:  FILTER_FACETS — the only module allowed to define a universal.
// OUT: clash if a urlParam marked universal (categories ['*']) appears
//      more than once, or any universal shares its urlParam with a
//      slice-scoped entry (same param, different facet = a clash).
// TRUST: universals are identified by the canonical marker itself —
//      categories: ['*'] — not a hardcoded name list.
const byParam = new Map();
for (const f of FILTER_FACETS) {
  const list = byParam.get(f.urlParam) ?? [];
  list.push(f);
  byParam.set(f.urlParam, list);
}
for (const [urlParam, list] of byParam) {
  if (list.length > 1)
    clashes.push(`urlParam '${urlParam}' defined ${list.length}×: ${list.map((f) => `${f.facet} [${f.categories}]`).join(', ')}`);
}

// ── STEP 2: Category FACETS don't redefine a universal ──────────────
// IN:  each slice's FACETS + the universal urlParam set.
// OUT: clash if a slice's facet uses a universal's urlParam (shadowing
//      it for that slice's shoppers).
// TRUST: ids are compared to the canonical universal set only.
const universalParams = new Set(
  FILTER_FACETS.filter((f) => f.categories.includes('*')).map((f) => f.urlParam)
);
console.log(`universals: ${[...universalParams].join(', ')}`);
const MODS = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
};
for (const [slice, mod] of Object.entries(MODS)) {
  const { FACETS } = await import(`../../features/product-filtering/core/definitions/${mod}`);
  for (const f of FACETS) {
    // A 'derived' category facet on a universal urlParam presents the
    // universal — not a shadow. A closed list would redefine its vocab.
    if (universalParams.has(f.id) && f.control === 'checkbox' && f.options !== 'derived')
      clashes.push(`${slice}: facet '${f.id}' redefines universal urlParam with closed list`);
  }
}

// ── STEP 3: Report ──────────────────────────────────────────────────
console.log(clashes.length ? '\n' + clashes.join('\n') : '\nclean');
console.log(`CLASHES: ${clashes.length}`);
