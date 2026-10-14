// Check 1.3 — zero duplicates: no two product documents are the same product.
// "Same product" = same brand + same normalised name (lower-case, &amp; decoded, punctuation
// and spacing ignored). Looks at ALL products, reports groups with at least one member in the slice,
// so a twin sitting outside the slice is still caught.
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

const ALL = ['headphones', 'audio-electronics', 'accessories'];
const SLICES = process.argv[2] ? [process.argv[2]] : ALL;
if (!process.argv[2]) console.log('No slice arg — running all three. Pass one of: ' + ALL.join(', '));

const norm = (s) => (s ?? '').toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, ' ').trim();
const PRODUCTS = `*[_type == "product"] | order(_id asc) [0...1000] { _id, name, "brand": brand->name, "inSlice": count(catalogueLocationKeys[@ in $keys]) > 0 }`;

for (const slice of SLICES) {
  const products = await client.fetch(PRODUCTS, { keys: keysFor(slice) });
  const groups = new Map();
  for (const p of products) {
    const key = `${norm(p.brand)}|${norm(p.name)}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  const dupes = [...groups.values()].filter((g) => g.length > 1 && g.some((p) => p.inSlice));
  console.log(`\n=== [1.3] ${slice} — ${products.length} products checked, duplicate groups: ${dupes.length} ===`);
  dupes.forEach((g, i) => {
    console.log(`\n── group ${i + 1} ──`);
    g.forEach((p) => console.log(`  ${p.inSlice ? 'in slice' : 'outside '}  ${p.brand ?? '(no brand)'} — ${p.name}  [${p._id}]`));
  });
  if (products.length >= 1000) console.log(`!! hit the 1000 cap — list may be truncated`);
}
