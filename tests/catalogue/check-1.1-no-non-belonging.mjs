// ══════════════════════════════════════════════════════════════════
// CHECK 1.1 — zero non-belonging products in each slice.
// Prints every product a slice claims, for a human verdict.
// Run: node tests/catalogue/check-1.1-no-non-belonging.mjs <slice>
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from './sanity-client.mjs';

// ── STEP 1: Resolve a slice slug to its full set of location keys ──
// IN:  data/catalogue-index.json + one slice slug.
// OUT: every location id inside that slice (top-level + mid + leaf,
//      all descendants).
// TRUST: the unroll walks children recursively, exactly like the app's
//      catalogueIndex.ts — so "in slice" here means the same thing the
//      storefront means, and nothing keyed at any depth is missed.
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const keysFor = (slug) => {
  const root = index.slugToIdMap[slug];
  const out = new Set();
  const stack = [root];
  while (stack.length) {
    const id = stack.pop();
    if (out.has(id)) continue;
    out.add(id);
    stack.push(...(index.slotMetadataMap[id]?.children ?? []));
  }
  return [...out];
};

const ALL = ['headphones', 'audio-electronics', 'accessories'];
const SLICES = process.argv[2] ? [process.argv[2]] : ALL;
if (!process.argv[2]) console.log('No slice arg — running all three. Pass one of: ' + ALL.join(', '));

// ── STEP 2: Fetch every product the slice claims ───────────────────
// IN:  one slice's `keys` from step 1.
// OUT: `inside` — every product holding at least one of those keys.
// TRUST: membership is declared by catalogueLocationKeys alone, and the
//      filter is `> 0` matches — one matching key puts a product in the
//      list, so no member can hide.
const IN = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;

for (const slice of SLICES) {
  const inside = await client.fetch(IN, { keys: keysFor(slice) });

// ── STEP 3: Print the slice membership list ────────────────────────
// IN:  `inside` from step 2.
// OUT: numbered list (brand — name, alphabetical, chunks of 5).
// TRUST: nothing filtered or re-fetched — what step 2 returned is what
//      you see, one line per document. The verdict is yours: anything a
//      shopper would call out of place = check fails.
  console.log(`\n=== [1.1] ${slice} — ${inside.length} products in slice ===`);
  inside.sort((a, b) => (a.brand ?? '').localeCompare(b.brand ?? '') || a.name.localeCompare(b.name));
  inside.forEach((p, i) => {
    if (i % 5 === 0) console.log(`\n── items ${i + 1}–${Math.min(i + 5, inside.length)} ──`);
    console.log(`${String(i + 1).padStart(3)}. ${p.brand ?? '(no brand)'} — ${p.name}`);
  });
  if (inside.length >= 1000) console.log(`!! slice hit the 1000 cap — list may be truncated`);
}
