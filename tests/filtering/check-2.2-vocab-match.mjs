// ══════════════════════════════════════════════════════════════════
// CHECK 2.2 — every facet's option set equals the real vocabulary.
// Pass = "MISMATCHES: 0" — no phantom values, none missing.
// The vocabulary is FILTER_FACETS.valueVocab; check 0.1 proves the
// Sanity schema's own lists equal it, so equal here = equal to the schema.
// Run: node tests/filtering/check-2.2-vocab-match.mjs <slice>
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: Load the slice's facet definitions + canonical vocab ───
// IN:  one slice slug.
// OUT: that category's FACETS, plus FILTER_FACETS — the canonical
//      vocabulary (the schema's lists, per check 0.1).
// TRUST: both sides imported from the real modules — no retyped copies.
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
if (!MOD) { console.log('Usage: node tests/filtering/check-2.2-vocab-match.mjs <slice>\n  slices: headphones, audio-electronics, accessories'); process.exit(1); }
const { FACETS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);

const mismatches = [];
const compared = [];
const notComparable = [];
for (const f of FACETS) {
  if (f.control !== 'checkbox') continue;

  // ── STEP 2a: closed lists — diff option values vs valueVocab ─────
  // IN:  facet.options values + FILTER_FACETS[urlParam].valueVocab.
  // OUT: appended mismatch lines: values offered but not in vocab
  //      (phantom), and vocab values with no offered option (missing).
  //      A facet whose vocab is a '<…>' placeholder has no schema list
  //      to equal: it is listed as not comparable, never silently passed.
  // TRUST: symmetric set difference on exact strings — the same class
  //      of defect past fixes caught (tribrid, ip67, case drift).
  if (f.options !== 'derived') {
    const canon = FILTER_FACETS.find((x) => x.urlParam === f.id);
    if (!canon) { mismatches.push(`${f.id}: no FILTER_FACETS entry`); continue; }
    if (canon.valueVocab.some((v) => v.startsWith('<'))) { notComparable.push(`${f.id} (placeholder vocab: no schema list)`); continue; }
    compared.push(f.id);
    const offered = new Set(f.options.map((o) => o.value));
    const vocab = new Set(canon.valueVocab);
    const phantom = [...offered].filter((v) => !vocab.has(v));
    const missing = [...vocab].filter((v) => !offered.has(v));
    if (phantom.length || missing.length)
      mismatches.push(`${f.id}: phantom=[${phantom}] missing=[${missing}]`);
    continue;
  }

  // ── STEP 2b: derived facets — vocab marker vs live distinct data ─
  // IN:  facet marked 'derived' (e.g. brand) + the slice's products.
  // OUT: appended mismatch if the canonical entry is not marked for
  //      derivation ('<brand-slug>' style placeholder) — i.e. a derived
  //      facet backed by a closed vocab would be a lie.
  // TRUST: checks the wiring claim, not the values; live-value printing
  //      for human read is check 2.3's job.
  const canon = FILTER_FACETS.find((x) => x.urlParam === f.id);
  if (canon && !canon.valueVocab.some((v) => v.startsWith('<')))
    mismatches.push(`${f.id}: derived in category defs but closed vocab in facetMap [${canon.valueVocab}]`);
  else notComparable.push(`${f.id} (derived from live data)`);
}

// ── STEP 3: Report ──────────────────────────────────────────────────
// IN:  mismatches + what was compared. OUT: both lists + the count.
// TRUST: "compared" is printed, so a pass cannot be an empty comparison.
console.log(`compared (${compared.length}): ${compared.join(', ')}`);
console.log(`not comparable (${notComparable.length}): ${notComparable.join(', ') || 'none'}`);
console.log(mismatches.length ? mismatches.join('\n') : 'clean');
console.log(`\nMISMATCHES: ${mismatches.length}`);
