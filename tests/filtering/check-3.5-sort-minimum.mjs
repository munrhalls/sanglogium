// ══════════════════════════════════════════════════════════════════
// CHECK 3.5 — a sort control shows only where the slice has ≥2 products.
// Pass = "THIN SLICES: 0" — every slice has ≥2 products, so the control
// may show everywhere. (If a slice ever drops below 2, visibility is a
// UI condition — see blueprint G1 dismissal.)
// Run: node tests/filtering/check-3.5-sort-minimum.mjs
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';

// ── STEP 1: Count products per slice (same unroll as mission 01) ────
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
let thin = 0;
for (const slug of ['headphones', 'audio-electronics', 'accessories']) {
  const keys = new Set(); const s = [index.slugToIdMap[slug]];
  while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); }
  const n = await client.fetch(
    `count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0])`,
    { keys: [...keys] }
  );
  console.log(`${slug}: ${n} products`);
  if (n < 2) thin++;
}
console.log(`\nTHIN SLICES: ${thin}`);
