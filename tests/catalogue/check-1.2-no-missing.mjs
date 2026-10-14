// Check 1.2 — zero missing products: nothing outside the slice should belong in it.
// Prints the out-of-slice list and the no-keys list for human verdict, then reconciles
// in-slice + outside + no-keys against the total product count.
// Run: node tests/catalogue/check-1.2-no-missing.mjs
import { readFileSync } from 'node:fs';
import { client } from './sanity-client.mjs';

// Mirrors resolveSlugToId + unrollDescendantKeys in
// features/catalogue/adapters/catalogue-index/catalogueIndex.ts
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

// Three disjoint sets: no keys (null or empty), keys that miss the slice, keys that hit it.
const NO_KEYS = `count(coalesce(catalogueLocationKeys, [])) == 0`;
const OUT = `*[_type == "product" && !(${NO_KEYS}) && count(catalogueLocationKeys[@ in $keys]) == 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;
const UNKEYED = `*[_type == "product" && ${NO_KEYS}] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;
const COUNTS = `{ "total": count(*[_type == "product"]), "inside": count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]) }`;

const print = (label, list) => {
  list.sort((a, b) => (a.brand ?? '').localeCompare(b.brand ?? '') || a.name.localeCompare(b.name));
  list.forEach((p, i) => {
    if (i % 5 === 0) console.log(`\n── items ${i + 1}–${Math.min(i + 5, list.length)} ──`);
    console.log(`${String(i + 1).padStart(3)}. ${p.brand ?? '(no brand)'} — ${p.name}`);
  });
  if (list.length >= 1000) console.log(`!! ${label} list hit the 1000 cap — may be truncated`);
};

for (const slice of SLICES) {
  const keys = keysFor(slice);
  const outside = await client.fetch(OUT, { keys });
  const unkeyed = await client.fetch(UNKEYED);
  const { total, inside } = await client.fetch(COUNTS, { keys });

  console.log(`\n=== [1.2] ${slice} — ${outside.length} products NOT in slice ===`);
  print('outside', outside);
  console.log(`\n=== [1.2] ${slice} — ${unkeyed.length} products with NO catalogueLocationKeys ===`);
  print('no-keys', unkeyed);

  const sum = inside + outside.length + unkeyed.length;
  console.log(`\n=== [1.2] ${slice} — reconcile: in slice ${inside} + outside ${outside.length} + no keys ${unkeyed.length} = ${sum}; total products ${total}; reconciles: ${sum === total} ===`);
}
