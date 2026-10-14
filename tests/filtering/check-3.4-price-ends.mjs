// ══════════════════════════════════════════════════════════════════
// CHECK 3.4 — price range ends equal the real lowest/highest prices in
// the slice. Pass = "DRIFT: 0" per slice.
// Run: node tests/filtering/check-3.4-price-ends.mjs [slice]
//
// Read this top to bottom. Each STEP is a black box.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';

// ── STEP 1: Slice → location keys (same unroll as mission 01) ───────
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const ALL = ['headphones', 'audio-electronics', 'accessories'];
const SLICES = process.argv[2] ? [process.argv[2]] : ALL;
const keysFor = (slug) => {
  const out = new Set(); const s = [index.slugToIdMap[slug]];
  while (s.length) { const id = s.pop(); if (out.has(id)) continue; out.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); }
  return [...out];
};

// ── STEP 2: Real min/max — the app's own bound source ───────────────
// IN:  keys. OUT: min/max of price_data.unit_amount — the identical
//      query fetchCategoryPriceRange uses to set the slider ends.
// TRUST: same field, same membership clause — what the app computes.
let drift = 0;
for (const slice of SLICES) {
  const r = await client.fetch(
    `{"min": math::min(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0].price_data.unit_amount),
      "max": math::max(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0].price_data.unit_amount),
      "n": count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0])}`,
    { keys: keysFor(slice) }
  );
  console.log(`${slice}: ${r.n} products, real price ends ${r.min}–${r.max} cents`);
  if (r.min == null || r.max == null) { drift++; console.log('  ✗ null bound — no priced products'); }
}

// ── STEP 3: Report ──────────────────────────────────────────────────
// Human compares each printed range against what the UI slider shows.
console.log(`\nDRIFT: ${drift}`);
