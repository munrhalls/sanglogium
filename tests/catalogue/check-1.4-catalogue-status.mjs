// ══════════════════════════════════════════════════════════════════
// CHECK 1.4 — catalogue status: what is in each slice right now.
// A readable list, not a pass/fail test. Run it any time for a status update.
// Run: node tests/catalogue/check-1.4-catalogue-status.mjs [slice]   (no slice = all three)
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from './sanity-client.mjs';

// ── STEP 1: Resolve a slice slug to its full set of location keys ──
// IN:  data/catalogue-index.json + one slice slug.
// OUT: every location id inside that slice (all descendants).
// TRUST: same recursive unroll the app uses — "in slice" matches what
//      the storefront means.
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

// ── STEP 2: Fetch the products in the slice ────────────────────────
// IN:  one slice's `keys`.
// OUT: `products` — every product in the slice: brand and name, sorted
//      by brand then name.
// TRUST: the query is the same "in slice" rule as check 1.1.
const PRODUCTS = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [0...1000] { name, "brand": brand->name }`;
const byName = (a, b) => (a.brand ?? '').localeCompare(b.brand ?? '') || a.name.localeCompare(b.name);

for (const slice of SLICES) {
  const products = (await client.fetch(PRODUCTS, { keys: keysFor(slice) })).sort(byName);

// ── STEP 3: Chunk for the eye ──────────────────────────────────────
// IN:  sorted `products` from step 2.
// OUT: one chunk per first letter of the brand (non-letters share "#");
//      a letter with more than 5 products splits into sub-chunks of 5.
// TRUST: pure grouping — every product lands in exactly one chunk, in
//      the order step 2 gave; nothing is dropped or added.
  const letterOf = (p) => ((p.brand ?? '').trim()[0] ?? '#').toUpperCase().replace(/[^A-Z]/, '#');
  const letters = new Map();
  for (const p of products) letters.set(letterOf(p), [...(letters.get(letterOf(p)) ?? []), p]);

// ── STEP 4: Print ──────────────────────────────────────────────────
// IN:  the chunks from step 3.
// OUT: header with the slice count; a big gap (3 blank lines) between
//      letters, a small gap (1 blank line) between sub-chunks; rows are
//      "brand — name", numbered through the whole slice.
// TRUST: the header count equals the number of numbered rows.
  console.log(`\n=== [1.4] ${slice} — ${products.length} products ===`);
  let n = 0;
  for (const [letter, list] of letters) {
    console.log(`\n\n\n── ${letter} ──  (${list.length})`);
    list.forEach((p, i) => {
      if (i > 0 && i % 5 === 0) console.log('');
      console.log(`${String(++n).padStart(3)}. ${p.brand ?? '(no brand)'} — ${p.name}`);
    });
  }
  if (products.length >= 1000) console.log(`\n!! hit the 1000 cap — list may be truncated`);
  console.log('');
}
