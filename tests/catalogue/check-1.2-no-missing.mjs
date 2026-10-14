// Check 1.2 — zero missing products: every product sits in one of the three slices.
// Pass = both lists below are EMPTY and the reconcile line says true.
// Products in a slice are judged by that slice's check 1.1; this check only finds the unplaced.
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

const SLICES = ['headphones', 'audio-electronics', 'accessories'];
const keys = [...new Set(SLICES.flatMap(keysFor))];

// Three disjoint sets: no keys (null or empty), keys that miss every slice, keys that hit a slice.
const NO_KEYS = `count(coalesce(catalogueLocationKeys, [])) == 0`;
const UNPLACED = `*[_type == "product" && !(${NO_KEYS}) && count(catalogueLocationKeys[@ in $keys]) == 0] | order(_id asc) [0...1000] { _id, name, "brand": brand->name }`;
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

const unplaced = await client.fetch(UNPLACED, { keys });
const unkeyed = await client.fetch(UNKEYED);
const { total, inside } = await client.fetch(COUNTS, { keys });

console.log(`\n=== [1.2] ${unplaced.length} products have keys but sit in NO slice ===`);
print('unplaced', unplaced);
console.log(`\n=== [1.2] ${unkeyed.length} products have NO catalogueLocationKeys ===`);
print('no-keys', unkeyed);

const sum = inside + unplaced.length + unkeyed.length;
console.log(`\n=== [1.2] in a slice ${inside} + unplaced ${unplaced.length} + no keys ${unkeyed.length} = ${sum}; total products ${total}; reconciles: ${sum === total} ===`);
console.log(`=== [1.2] PASS: ${unplaced.length === 0 && unkeyed.length === 0 && sum === total} ===`);
