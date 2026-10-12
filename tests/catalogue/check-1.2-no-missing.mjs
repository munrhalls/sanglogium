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

const ALL = ['headphones', 'audio-electronics', 'accessories'];
const SLICES = process.argv[2] ? [process.argv[2]] : ALL;
if (!process.argv[2]) console.log('No slice arg — running all three. Pass one of: ' + ALL.join(', '));

const OUT = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) == 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;

for (const slice of SLICES) {
  const outside = await client.fetch(OUT, { keys: keysFor(slice) });
  console.log(`\n=== [1.2] ${slice} — ${outside.length} products NOT in slice ===`);
  outside.sort((a, b) => (a.brand ?? '').localeCompare(b.brand ?? '') || a.name.localeCompare(b.name));
  outside.forEach((p, i) => {
    if (i % 5 === 0) console.log(`\n── items ${i + 1}–${Math.min(i + 5, outside.length)} ──`);
    console.log(`${String(i + 1).padStart(3)}. ${p.brand ?? '(no brand)'} — ${p.name}`);
  });
  if (outside.length >= 1000) console.log(`!! outside list hit the 1000 cap — may be truncated`);
}
