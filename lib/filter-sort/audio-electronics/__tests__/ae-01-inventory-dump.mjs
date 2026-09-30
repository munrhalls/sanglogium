// sang-logium-ttn, step 1 -- fetch every audio-electronics product fresh from
// Sanity and dump its filterable facet fields. Mirrors
// lib/filter-sort/__tests__/01-inventory-dump.mjs (sang-logium-ajf,
// headphones) field-for-field in structure; the field list below is the
// audio-electronics-specific + shared facet set exposed as live filters in
// lib/catalogue/facetMap.ts (categories: ["audio-electronics"] or shared) --
// not the full audio-electronics schema, most of which is
// per-deviceType display-only detail, never surfaced as a filter.
//
// Lives under lib/filter-sort/audio-electronics/__tests__/ (not the
// sibling headphones __tests__/ folder) because a just-discovered local
// .git/info/exclude rule targets lib/filter-sort/__tests__/ for cleanup by
// some concurrent process -- new untracked files written there vanish
// within seconds. sanityRaw.mjs itself is a tracked file in that folder and
// unaffected, so it's still imported from there rather than duplicated.
//
// Run: node --env-file=.env.local lib/filter-sort/audio-electronics/__tests__/ae-01-inventory-dump.mjs

import { writeFileSync } from 'node:fs';
import { sanityQuery } from '../../__tests__/sanityRaw.mjs';

// Every field below is a live facetMap.ts entry tagged categories:
// ["audio-electronics"] (device-specific) or shared with other slices
// (condition, bluetoothCodecs) and actually applied to
// audio-electronics products.
const FIELD_PATHS = [
  'price', 'brand', 'inStock', 'category',
  'deviceType', 'formFactor', 'deviceConnectivity', 'bluetoothCodecs',
  'inputs', 'balancedOutput', 'amplification', 'dacIncluded',
  'dsdSupport', 'dacChipsetFamily', 'streamingPlatformSupport', 'condition',
];

function getPath(obj, path) {
  return path.split('.').reduce((cur, key) => (cur == null ? undefined : cur[key]), obj);
}

async function main() {
  const raw = await sanityQuery(
    `*[_type == "product"]{
      _id, name, catalogueLocationKeys, filterAttributes,
      "brandSlug": brand->slug.current,
      "priceDataCents": price_data.unit_amount,
      stock, reservedStock
    }`,
  );

  console.log(`Fetched ${raw.length} total products from Sanity.`);

  const audioElectronics = raw.filter((p) =>
    (p.filterAttributes?.category || []).includes('audio-electronics'),
  );
  console.log(`audio-electronics (by filterAttributes.category): ${audioElectronics.length}`);

  const inventory = audioElectronics.map((p) => {
    const fa = p.filterAttributes || {};
    const entry = {
      _id: p._id,
      name: p.name,
      catalogueLocationKeys: p.catalogueLocationKeys,
    };
    for (const path of FIELD_PATHS) {
      entry[path] = getPath(fa, path) ?? null;
    }
    entry.priceCentsResolved = fa.price ?? p.priceDataCents ?? null;
    entry.inStockResolved =
      fa.inStock != null ? fa.inStock : (p.stock ?? 0) - (p.reservedStock ?? 0) > 0;
    return entry;
  });

  writeFileSync(
    new URL('./data/audio-electronics-inventory.json', import.meta.url),
    JSON.stringify(inventory, null, 2),
  );

  console.log(`\nWrote ${inventory.length} products to lib/filter-sort/audio-electronics/__tests__/data/audio-electronics-inventory.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
