// Check 1.2 — zero missing products: nothing outside the slice should belong in it.
// Prints the full out-of-slice list for human verdict. Run: node tests/catalogue/check-1.2-no-missing.mjs
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

const SLICES = ['headphones', 'audio-electronics', 'accessories'];
const OUT = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) == 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;

for (const slice of SLICES) {
  const outside = await client.fetch(OUT, { keys: keysFor(slice) });
  console.log(`\n=== [1.2] ${slice} — ${outside.length} products NOT in slice ===`);
  for (const p of outside) console.log(`${p.name} — ${p.brand ?? '(no brand)'}`);
  if (outside.length >= 1000) console.log(`!! outside list hit the 1000 cap — may be truncated`);
}
