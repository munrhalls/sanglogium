// ══════════════════════════════════════════════════════════════════
// CHECK 1.2 — zero missing products: every product sits in a slice.
// Pass = both lists EMPTY + reconciles: true + PASS: true.
// Run: node tests/catalogue/check-1.2-no-missing.mjs
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from './sanity-client.mjs';

// ── STEP 1: Collect every location key that belongs to a slice ─────
// IN:  data/catalogue-index.json + the three slice slugs.
// OUT: `keys` — every location id inside headphones, audio-electronics,
//      accessories (all descendants).
// TRUST: same recursive unroll the app uses — "in a slice" means the
//      same thing here as on the storefront, at any depth.
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

const SLICES = ['headphones', 'audio-electronics', 'accessories'];
const keys = [...new Set(SLICES.flatMap(keysFor))];

// ── STEP 2: Fetch the three sets that must partition all products ──
// IN:  `keys` from step 1.
// OUT: `unplaced` — has keys, none in a slice. `unkeyed` — no keys.
//      `inside` + `total` — counts for the reconcile.
// TRUST: the three sets are disjoint and exhaustive by construction:
//      a product has keys or it doesn't; if it has keys, they either
//      hit a slice or they don't. Every product lands in exactly one
//      set — which is exactly what the reconcile in step 4 verifies.
const NO_KEYS = `count(coalesce(catalogueLocationKeys, [])) == 0`;
const UNPLACED = `*[_type == "product" && !(${NO_KEYS}) && count(catalogueLocationKeys[@ in $keys]) == 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;
const UNKEYED = `*[_type == "product" && ${NO_KEYS}] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;
const COUNTS = `{ "total": count(*[_type == "product"]), "inside": count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]) }`;

const unplaced = await client.fetch(UNPLACED, { keys });
const unkeyed = await client.fetch(UNKEYED);
const { total, inside } = await client.fetch(COUNTS, { keys });

// ── STEP 3: Print both problem lists ───────────────────────────────
// IN:  `unplaced`, `unkeyed` from step 2.
// OUT: numbered lists (brand — name, chunks of 5).
// TRUST: nothing filtered — what step 2 returned is what you see.
const print = (label, list) => {
  list.sort((a, b) => (a.brand ?? '').localeCompare(b.brand ?? '') || a.name.localeCompare(b.name));
  list.forEach((p, i) => {
    if (i % 5 === 0) console.log(`\n── items ${i + 1}–${Math.min(i + 5, list.length)} ──`);
    console.log(`${String(i + 1).padStart(3)}. ${p.brand ?? '(no brand)'} — ${p.name}`);
  });
  if (list.length >= 1000) console.log(`!! ${label} list hit the 1000 cap — may be truncated`);
};

console.log(`\n=== [1.2] ${unplaced.length} products have keys but sit in NO slice ===`);
print('unplaced', unplaced);
console.log(`\n=== [1.2] ${unkeyed.length} products have NO catalogueLocationKeys ===`);
print('no-keys', unkeyed);

// ── STEP 4: Reconcile and verdict ──────────────────────────────────
// IN:  the three set sizes + total.
// OUT: reconcile line + PASS — true only when both lists are empty AND
//      in-slice + unplaced + unkeyed equals total (no product invisible).
const sum = inside + unplaced.length + unkeyed.length;
console.log(`\n=== [1.2] in a slice ${inside} + unplaced ${unplaced.length} + no keys ${unkeyed.length} = ${sum}; total products ${total}; reconciles: ${sum === total} ===`);
console.log(`=== [1.2] PASS: ${unplaced.length === 0 && unkeyed.length === 0 && sum === total} ===`);
