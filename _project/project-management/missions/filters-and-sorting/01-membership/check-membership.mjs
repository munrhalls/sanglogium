// Proof check — mission 01-membership (filters & sorting).
// Prints facts for human verdict. Run: node check-membership.mjs
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

process.loadEnvFile(new URL('../../../../.env.local', import.meta.url));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14',
  useCdn: false,
  perspective: 'published',
});

// Mirrors resolveSlugToId + unrollDescendantKeys in
// features/catalogue/adapters/catalogue-index/catalogueIndex.ts
const index = JSON.parse(readFileSync(new URL('../../../../data/catalogue-index.json', import.meta.url)));
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
const OUT = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) == 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;

for (const slice of SLICES) {
  const keys = keysFor(slice);
  const inside = await client.fetch(IN, { keys });
  const outside = await client.fetch(OUT, { keys });

  console.log(`\n=== [1.1] ${slice} — ${inside.length} products in slice ===`);
  for (const p of inside) console.log(`${p.name} — ${p.brand ?? '(no brand)'}`);
  if (inside.length >= 1000) console.log(`!! slice hit the 1000 cap — list may be truncated`);

  console.log(`\n=== [1.2] ${slice} — ${outside.length} products NOT in slice ===`);
  for (const p of outside) console.log(`${p.name} — ${p.brand ?? '(no brand)'}`);
  if (outside.length >= 1000) console.log(`!! outside list hit the 1000 cap — may be truncated`);

  const distinct = new Set(inside.map((p) => p._id)).size;
  console.log(`\n=== [1.3] ${slice} — returned: ${inside.length}, distinct: ${distinct}, equal: ${inside.length === distinct} ===`);
}
