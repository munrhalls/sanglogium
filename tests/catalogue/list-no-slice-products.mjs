// ══════════════════════════════════════════════════════════════════
// DELETE-LIST: every product that belongs to NO slice.
// Run: node tests/catalogue/list-no-slice-products.mjs
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
//      accessories (top-level + mid + leaf, all descendants).
// TRUST: the unroll walks children recursively, exactly like the app's
//      catalogueIndex.ts, so a product keyed to any depth in a slice
//      counts as "in" — nothing placed under a leaf is missed.
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

// ── STEP 2: Fetch the two delete-candidate groups ──────────────────
// IN:  `keys` from step 1.
// OUT: `unplaced` — products that HAVE keys but none land in `keys`.
//      `unkeyed`  — products with no catalogueLocationKeys at all.
// TRUST: the two GROQ filters are complementary and cover every way a
//      product can sit outside all slices: either the array is empty
//      (unkeyed) or none of its members is a slice key (unplaced).
const NO_KEYS = `count(coalesce(catalogueLocationKeys, [])) == 0`;
const UNPLACED = `*[_type == "product" && !(${NO_KEYS}) && count(catalogueLocationKeys[@ in $keys]) == 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;
const UNKEYED = `*[_type == "product" && ${NO_KEYS}] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;

const unplaced = await client.fetch(UNPLACED, { keys });
const unkeyed = await client.fetch(UNKEYED);

// ── STEP 3: Print the delete-list ──────────────────────────────────
// IN:  `unplaced`, `unkeyed` from step 2.
// OUT: two labelled lists, sorted brand → name, each line carrying the
//      `_id` a delete command consumes — plus a total.
// TRUST: nothing is filtered or re-fetched here; what step 2 returned
//      is what you see, one line per document.
const print = (label, list) => {
  console.log(`\n=== ${label}: ${list.length} ===`);
  list.sort((a, b) => (a.brand ?? '').localeCompare(b.brand ?? '') || a.name.localeCompare(b.name));
  list.forEach((p, i) => console.log(`${String(i + 1).padStart(3)}. ${p._id}  ${p.brand ?? '(no brand)'} — ${p.name}`));
  if (list.length >= 1000) console.log(`!! ${label} list hit the 1000 cap — may be truncated`);
};

print('products with keys in NO slice', unplaced);
print('products with NO catalogueLocationKeys', unkeyed);
console.log(`\n=== total delete candidates: ${unplaced.length + unkeyed.length} ===`);
