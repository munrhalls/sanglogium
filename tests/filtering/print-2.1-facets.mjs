// ══════════════════════════════════════════════════════════════════
// CHECK 2.1 — zero nonsensical or misplaced options in a slice.
// This script makes NO decision — it prints the complete offered option
// set for one slice so a human can read it and judge: does every facet
// and every option make sense for this slice's products?
// Run: node tests/filtering/print-2.1-facets.mjs <slice>
//      (headphones | audio-electronics | accessories)
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════

// ── STEP 1: Load the slice's own facet definitions ─────────────────
// IN:  one slice slug.
// OUT: FACETS + FACET_GROUPS from that category's definitions module —
//      the exact array the sidebar renders from.
// TRUST: no copy, no transform — node imports the same .ts file the app
//      compiles, so what prints is what ships.
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
if (!MOD) { console.log('Usage: node tests/filtering/print-2.1-facets.mjs <slice>\n  slices: headphones, audio-electronics, accessories'); process.exit(1); }
const { FACETS, FACET_GROUPS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);

// ── STEP 2: Print every facet under its group, every option listed ──
// IN:  FACETS, FACET_GROUPS.
// OUT: the whole offered set for the slice, grouped as the UI groups it.
// TRUST: pure iteration — nothing filtered, merged, or reworded.
const labelOf = (g) => FACET_GROUPS.find((x) => x.id === g)?.label || g;
let i = 0;
for (const g of FACET_GROUPS) {
  const facets = FACETS.filter((f) => f.group === g.id);
  if (!facets.length) continue;
  console.log(`\n── ${labelOf(g.id)} ──`);
  for (const f of facets) {
    i++;
    const head = `${i}. ${f.label}  [${f.id}:${f.control}${f.subheading ? ` · under "${f.subheading}"` : ''}]`;
    if (f.control === 'checkbox') {
      const opts = f.options === 'derived' ? '(derived from live data)' : f.options.map((o) => `${o.label} [${o.value}]`).join(', ');
      console.log(`${head}\n    ${opts}`);
    } else if (f.control === 'range') {
      console.log(`${head}\n    range ${f.min}–${f.max} ${f.unit}`);
    } else {
      console.log(head);
    }
  }
}
console.log(`\n${i} facets printed for ${process.argv[2]}. Read each option: sensible for this slice?`);
