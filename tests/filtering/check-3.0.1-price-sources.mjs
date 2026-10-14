// ══════════════════════════════════════════════════════════════════
// CHECK 3.0.1 — the price the filters read equals the price the slider
// is built from.
// Prerequisite of 1.4: the slider ends come from price_data.unit_amount
// (fetchCategoryPriceRange), but the price filter and the facet counts
// read filterAttributes.price FIRST (buildProductQuery.ts S2,
// facetCounts.ts getPriceCents). Where the two differ, "the range ends"
// and "what the range returns" are different prices.
// Pass = "MIRROR DRIFT: 0".
// Run: node tests/filtering/check-3.0.1-price-sources.mjs
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';

// ── STEP 1: Slice → location keys (same unroll as mission 01) ───────
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const keysFor = (slug) => {
  const out = new Set(); const s = [index.slugToIdMap[slug]];
  while (s.length) { const id = s.pop(); if (out.has(id)) continue; out.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); }
  return [...out];
};

// ── STEP 2: Both prices for every product of each slice ─────────────
// IN:  keys per slice. OUT: name, price_data.unit_amount (cents) and
//      filterAttributes.price per product.
// TRUST: same membership query as mission 01; both fields read raw.
let drift = 0;
for (const slice of ['headphones', 'audio-electronics', 'accessories']) {
  const products = await client.fetch(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]{ name, "unit": price_data.unit_amount, "mirror": filterAttributes.price }`,
    { keys: keysFor(slice) }
  );

// ── STEP 3: Drift = no real price, or a mirror that is not that price ─
// IN:  products. OUT: drifting products with both raw values.
// TRUST: the mirror counts as agreeing only if it is the same number of
//      cents. A mirror in dollars, an object, a string — all differ. An
//      absent mirror agrees (the app falls back to price_data).
  const bad = products.filter((p) => typeof p.unit !== 'number' || (p.mirror != null && p.mirror !== p.unit));
  drift += bad.length;
  console.log(`${bad.length ? '✗' : ' '} ${slice}: ${products.length} products, ${bad.length} drifting`);
  for (const p of bad) console.log(`    ${p.name}: price_data ${JSON.stringify(p.unit)} vs filterAttributes.price ${JSON.stringify(p.mirror)}`);
}

// ── STEP 4: Report ──────────────────────────────────────────────────
console.log(`\nMIRROR DRIFT: ${drift}`);
