// ══════════════════════════════════════════════════════════════════
// CHECK 3.4 — the price slider's ends equal the real lowest/highest
// prices in the slice. Pass = "DRIFT: 0".
// Run: node tests/filtering/check-3.4-price-ends.mjs [slice]
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
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

// ── STEP 2: The app's own price query and slider rule, read as text ──
// IN:  the source text of fetchCategoryPriceRange.ts, priceBounds.ts and
//      platform/utils/price.ts (tooling may read runtime files, not import them).
// OUT: QUERY — the GROQ the page runs for the slider; CEILING — the dollar
//      amount above which resolvePriceBounds caps the slider; and the proof
//      that cents become dollars by a plain "/ 100".
// TRUST: all three are lifted verbatim from the app's files, so they
//      cannot drift from a copy. resolvePriceBounds returns
//      { min: minPrice/100, max: maxPrice/100 } whenever maxPrice/100 ≤
//      CEILING and caps the max otherwise; getListingPage.ts hands min/max
//      straight to the slider (FilterSidebar → PriceControl → <input min max>,
//      no rounding).
const text = (rel) => readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
const QUERY = text('features/product-filtering/adapters/sanity/fetchCategoryPriceRange.ts').match(/groq`([\s\S]*?)`/)[1];
const CEILING = Number(text('features/product-filtering/core/rules/priceBounds.ts').match(/const NORMAL_PRICE_CEILING = ([\d_]+);/)[1].replace(/_/g, ''));
if (!/return cents \/ 100;/.test(text('platform/utils/price.ts'))) throw new Error('centsToDisplay is no longer a plain /100 — re-read this check');

// ── STEP 3: Real ends vs the ends the slider is given, per slice ────
// IN:  QUERY + keys + CEILING.
// OUT: per slice — real lowest/highest (plain min/max over every product's
//      price_data.unit_amount, cents); drift when the app's own min/max
//      aggregates differ from them, or the real highest exceeds CEILING
//      (the slider max would then be capped below it).
// TRUST: "real" is computed here from the full price list, not taken from
//      the app's math::min/max, so the app's aggregation is tested too.
let drift = 0;
for (const slice of SLICES) {
  const r = await client.fetch(QUERY, { keys: keysFor(slice) });
  const prices = r.prices.filter((p) => typeof p === 'number');
  const realMin = Math.min(...prices);
  const realMax = Math.max(...prices);
  const aggOk = r.minPrice === realMin && r.maxPrice === realMax;
  const capOk = realMax / 100 <= CEILING;
  if (!aggOk || !capOk) drift++;
  console.log(`${aggOk && capOk ? ' ' : '✗'} ${slice}: ${prices.length} products | real $${realMin / 100} – $${realMax / 100} | slider $${realMin / 100} – $${capOk ? realMax / 100 : '(capped below real max)'} | app aggregates ${aggOk ? 'agree' : 'DISAGREE'} | cap ceiling $${CEILING}`);
}

// ── STEP 4: Report ──────────────────────────────────────────────────
console.log(`\nDRIFT: ${drift}`);
