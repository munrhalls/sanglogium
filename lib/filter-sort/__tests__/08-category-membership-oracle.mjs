// sang-logium-x9s -- independent oracle for "does every product shown on the
// headphones page actually belong there". Fetched fresh from Sanity, checked
// against multiple independent signals, none of which reuse buildProductQuery.ts,
// facetMap.ts, or any pre-existing category-membership assumption:
//
//   A. deviceType leakage -- filterAttributes.deviceType is documented in
//      productType.ts (categories: ["audio-electronics"]) as an audio-
//      electronics-only gate field. A headphones-tagged product that also
//      carries a populated deviceType is a direct contamination signal --
//      this is the exact shape of bug that miscategorized the AMBEO Max
//      Soundbar (sang-logium-iop).
//   A2. deviceConnectivity leakage -- filterAttributes.deviceConnectivity is
//      gated to audio-electronics products only (productType.ts).
//   A3. accessoryType leakage -- filterAttributes.accessoryType is gated to
//      accessories products only (productType.ts).
//   A4. Cross-category contamination -- filterAttributes.category contains
//      "audio-electronics" or "accessories" alongside "headphones".
//   B. Name-keyword mismatch -- product name contains a word grounded in the
//      productType.ts schema (e.g. "dac") and strongly associated with a
//      non-headphone device category.
//   C. No headphone-defining facet at all -- wearingStyle, driverType, AND
//      acousticDesign all empty/null. Every genuine headphone/IEM product
//      should carry at least one of these.
//
// A product tripping ANY signal is flagged with its reason(s) -- not deleted,
// not auto-fixed. Output is a reviewable list, not a silent pass/fail.
//
// Run: node --env-file=.env.local lib/filter-sort/__tests__/08-category-membership-oracle.mjs

import { writeFileSync } from 'node:fs';
import { sanityQuery } from './sanityRaw.mjs';

const NON_HEADPHONE_KEYWORDS = [
  'cd player transport', 'cd-player-transport',
  'network streamer', 'network-streamer',
  'cd player', 'cd-player',
  'dac',
  'soundbar', 'speaker', 'turntable', 'amplifier', 'receiver',
  'preamplifier', 'preamp', 'streamer', 'transport', 'subwoofer', 'dock',
  'charger',
];

async function main() {
  const raw = await sanityQuery(
    `*[_type == "product" && "headphones" in filterAttributes.category]{
      _id, name,
      "category": filterAttributes.category,
      "deviceType": filterAttributes.deviceType,
      "deviceConnectivity": filterAttributes.deviceConnectivity,
      "accessoryType": filterAttributes.accessoryType,
      "wearingStyle": filterAttributes.wearingStyle,
      "driverType": filterAttributes.driverType,
      "acousticDesign": filterAttributes.acousticDesign,
      "productCategory": filterAttributes.productCategory,
      "connectivity": filterAttributes.connectivity
    }`,
  );

  const flagged = [];
  for (const p of raw) {
    const reasons = [];

    if (p.deviceType != null) {
      reasons.push(
        `deviceType="${p.deviceType}" is set, but that field is gated to audio-electronics products only (productType.ts) -- fix: clear filterAttributes.deviceType on this document, or if it genuinely belongs in audio-electronics, remove "headphones" from filterAttributes.category and add "audio-electronics".`,
      );
    }

    if (p.deviceConnectivity != null) {
      reasons.push(
        `deviceConnectivity="${p.deviceConnectivity}" is set, but that field is gated to audio-electronics products only (productType.ts) -- fix: clear filterAttributes.deviceConnectivity on this document, or if it genuinely belongs in audio-electronics, remove "headphones" from filterAttributes.category and add "audio-electronics".`,
      );
    }

    if (p.accessoryType != null) {
      reasons.push(
        `accessoryType="${p.accessoryType}" is set, but that field is gated to accessories products only (productType.ts) -- fix: clear filterAttributes.accessoryType on this document, or if it genuinely belongs in accessories, remove "headphones" from filterAttributes.category and add "accessories".`,
      );
    }

    const crossCategories = p.category?.filter((c) => c !== 'headphones') ?? [];
    if (crossCategories.length > 0) {
      reasons.push(
        `filterAttributes.category includes "${crossCategories.join(', ')}" alongside "headphones" -- a product cannot simultaneously belong to the headphones slice and another category (productType.ts) -- fix: remove the conflicting category or re-tag the product under the correct slice.`,
      );
    }

    const nameLower = p.name.toLowerCase();
    const hitKeyword = NON_HEADPHONE_KEYWORDS.find((k) => nameLower.includes(k));
    if (hitKeyword) {
      reasons.push(
        `name contains "${hitKeyword}", a non-headphone device keyword -- fix: verify whether this product is actually a headphone; if not, remove "headphones" from filterAttributes.category and re-tag it under the correct category.`,
      );
    }

    const noWearingStyle = !p.wearingStyle || p.wearingStyle.length === 0;
    const noDriverType = !p.driverType || p.driverType.length === 0;
    const noAcousticDesign = !p.acousticDesign;
    if (noWearingStyle && noDriverType && noAcousticDesign) {
      reasons.push(
        'wearingStyle, driverType, AND acousticDesign are all empty -- no headphone-defining facet is populated at all -- fix: either backfill these three fields with correct values, or this product does not belong under "headphones".',
      );
    }

    if (reasons.length > 0) {
      flagged.push({ _id: p._id, name: p.name, reasons });
    }
  }

  console.log(`Checked ${raw.length} products tagged filterAttributes.category="headphones".`);
  console.log(`Flagged: ${flagged.length}\n`);
  for (const f of flagged) {
    console.log(`${f._id} -- ${f.name}`);
    for (const r of f.reasons) console.log(`  - ${r}`);
  }
  if (flagged.length === 0) {
    console.log('ZERO FLAGS -- all headphones-tagged products pass all independent category-membership signals.');
  }

  writeFileSync(
    new URL('./data/category-membership-flags.json', import.meta.url),
    JSON.stringify(flagged, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
