// Check 1.1 — zero non-belonging products in each slice.
// Prints the full in-slice list for human verdict. Run: node tests/catalogue/check-1.1-no-non-belonging.mjs
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

process.loadEnvFile(new URL('../../.env.local', import.meta.url));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14',
  useCdn: false,
  perspective: 'published',
});

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
  console.log(`\n=== [1.1] ${slice} — ${inside.length} products in slice ===`);
  for (const p of inside) console.log(`${p.name} — ${p.brand ?? '(no brand)'}`);
  if (inside.length >= 1000) console.log(`!! slice hit the 1000 cap — list may be truncated`);
}
