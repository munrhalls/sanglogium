// Lists every product that belongs to NO slice — the delete-list for the
// membership cleanup. Two groups: products with no catalogueLocationKeys,
// and products whose keys hit none of the three slices.
// Run: node tests/catalogue/list-no-slice-products.mjs
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
const keys = [...new Set(SLICES.flatMap(keysFor))];

const NO_KEYS = `count(coalesce(catalogueLocationKeys, [])) == 0`;
const UNPLACED = `*[_type == "product" && !(${NO_KEYS}) && count(catalogueLocationKeys[@ in $keys]) == 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;
const UNKEYED = `*[_type == "product" && ${NO_KEYS}] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;

const print = (label, list) => {
  console.log(`\n=== ${label}: ${list.length} ===`);
  list.sort((a, b) => (a.brand ?? '').localeCompare(b.brand ?? '') || a.name.localeCompare(b.name));
  list.forEach((p, i) => console.log(`${String(i + 1).padStart(3)}. ${p._id}  ${p.brand ?? '(no brand)'} — ${p.name}`));
  if (list.length >= 1000) console.log(`!! ${label} list hit the 1000 cap — may be truncated`);
};

const unplaced = await client.fetch(UNPLACED, { keys });
const unkeyed = await client.fetch(UNKEYED);

print('products with keys in NO slice', unplaced);
print('products with NO catalogueLocationKeys', unkeyed);
console.log(`\n=== total delete candidates: ${unplaced.length + unkeyed.length} ===`);
