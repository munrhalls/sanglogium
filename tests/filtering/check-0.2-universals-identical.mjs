// ══════════════════════════════════════════════════════════════════
// CHECK 0.2 — each universal facet is defined identically in every slice.
// Prerequisite of 1.4: check 2.4 proves universals are single-source and
// never shadowed by a closed list; it does not prove the three slices
// present them the same (name, control, options, group).
// Pass = "DRIFT: 0".
// Run: node tests/filtering/check-0.2-universals-identical.mjs
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: Load every slice's facets and groups ────────────────────
// IN:  the three category modules.
// OUT: `slices` — { slice, FACETS, FACET_GROUPS } for each.
// TRUST: the same modules the sidebar renders from; no copies.
const MODS = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
};
const slices = [];
for (const [slice, mod] of Object.entries(MODS)) {
  slices.push({ slice, ...(await import(`../../features/product-filtering/core/definitions/${mod}`)) });
}

// ── STEP 2: Name the universals ─────────────────────────────────────
// IN:  FILTER_FACETS.
// OUT: `universals` — urlParams marked categories ['*'].
// TRUST: the canonical marker itself, not a hardcoded name list.
const universals = FILTER_FACETS.filter((f) => f.categories.includes('*')).map((f) => f.urlParam);
console.log(`universals: ${universals.join(', ')}\n`);

// ── STEP 3: Each universal that is a facet reads the same everywhere ─
// IN:  `universals` + `slices`.
// OUT: per universal, its definition in each slice; drift if it is
//      absent from a slice or any definition differs.
// TRUST: compares the full definition (label, control, options, group,
//      sub-heading, unit, range) as JSON — any visible difference shows.
//      A universal with no facet entry anywhere is the price slider
//      (step 4), not a drift.
let drift = 0;
for (const u of universals) {
  const defs = slices.map((s) => s.FACETS.find((f) => f.id === u));
  if (defs.every((d) => !d)) continue;
  const json = defs.map((d) => (d ? JSON.stringify({ ...d, id: undefined }) : 'ABSENT'));
  const same = json.every((j) => j === json[0] && j !== 'ABSENT');
  if (!same) drift++;
  console.log(`${same ? ' ' : '✗'} ${u}: ${same ? json[0] : slices.map((s, i) => `${s.slice}=${json[i]}`).join('\n    ')}`);
}

// ── STEP 4: The price slider is shared, not per-slice ───────────────
// IN:  `slices`.
// OUT: drift if a slice lacks the 'commercial' group (where the shared
//      price control renders) or defines its own 'price' facet.
// TRUST: FilterSidebar renders one PriceControl (label "Price") inside
//      the 'commercial' group of whichever slice is shown.
for (const s of slices) {
  const hasHost = s.FACET_GROUPS.some((g) => g.id === 'commercial');
  const ownPrice = s.FACETS.some((f) => f.id === 'price');
  if (!hasHost || ownPrice) drift++;
  console.log(`${hasHost && !ownPrice ? ' ' : '✗'} price: ${s.slice} ${hasHost ? "has 'commercial' group" : "LACKS 'commercial' group"}${ownPrice ? ', defines its own price facet' : ''}`);
}

// ── STEP 5: Report ──────────────────────────────────────────────────
console.log(`\nDRIFT: ${drift}`);
