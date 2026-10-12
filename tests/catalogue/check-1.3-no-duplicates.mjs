// Check 1.3 — zero duplicates: returned count equals distinct product IDs.
// Run: node tests/catalogue/check-1.3-no-duplicates.mjs
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
const IN = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;

for (const slice of SLICES) {
  const inside = await client.fetch(IN, { keys: keysFor(slice) });
  const distinct = new Set(inside.map((p) => p._id)).size;
  console.log(`=== [1.3] ${slice} — returned: ${inside.length}, distinct: ${distinct}, equal: ${inside.length === distinct}`);
}
