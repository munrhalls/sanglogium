// sang-logium-ajf, step 1 — fetch every headphones product fresh from Sanity
// and dump its filterable facet fields. Category membership is decided by
// filterAttributes.category (schema: productType.ts, a plain closed-vocab
// array field populated on every product, categories: ["all-products"]) --
// chosen over catalogueLocationKeys after checking real data directly:
// catalogueLocationKeys stores opaque VFS hash IDs (e.g. "ugyeto8653n..."),
// meaningless without depending on the generated data/catalogue-index.json,
// which is exactly the kind of pre-existing repo artifact this proof must not
// lean on. filterAttributes.category stores plain readable strings
// ("headphones") and needs no such dependency. No import from lib/catalogue/**
// or sanity-cms/lib/** anywhere in this file.
//
// Run: node --env-file=.env.local lib/filter-sort/__tests__/01-inventory-dump.mjs

import { writeFileSync } from 'node:fs';
import { sanityQuery } from './sanityRaw.mjs';

// Every filterAttributes field this session independently determined (by
// reading productType.ts directly) is (a) tagged for headphones or universal
// ("*"), and (b) an actual filter -- excludes driverConfigDetail ("Display-only"
// per its own schema description) and sourcing (citation metadata, not a filter).
const FIELD_PATHS = [
  'price', 'brand', 'inStock',
  'awards', 'productCategory', 'wearingStyle', 'acousticDesign', 'fitType',
  'connectivity', 'portable', 'soundSignature', 'impedanceOhms', 'sensitivityDbMw',
  'requiresAmplifier', 'microphone', 'cableTermination', 'detachableCable',
  'cableLengthM', 'foldable', 'ipxRating', 'bluetoothCodecs', 'anc',
  'driverType', 'driverConfigBucket',
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

  const headphones = raw.filter((p) =>
    (p.filterAttributes?.category || []).includes('headphones'),
  );
  console.log(`headphones (by filterAttributes.category): ${headphones.length}`);

  const inventory = headphones.map((p) => {
    const fa = p.filterAttributes || {};
    const entry = {
      _id: p._id,
      name: p.name,
      catalogueLocationKeys: p.catalogueLocationKeys,
    };
    for (const path of FIELD_PATHS) {
      entry[path] = getPath(fa, path) ?? null;
    }
    entry.freqResponseHzMin = fa.freqResponseHz?.min ?? null;
    entry.freqResponseHzMax = fa.freqResponseHz?.max ?? null;
    entry.batteryLifeHoursAncOff = fa.batteryLifeHours?.ancOff ?? null;
    entry.batteryLifeHoursAncOn = fa.batteryLifeHours?.ancOn ?? null;
    // Fallbacks mirroring the schema's own documented coalesce intent
    // (productType.ts comments), computed here independently.
    entry.priceCentsResolved = fa.price ?? p.priceDataCents ?? null;
    entry.inStockResolved =
      fa.inStock != null ? fa.inStock : (p.stock ?? 0) - (p.reservedStock ?? 0) > 0;
    return entry;
  });

  writeFileSync(
    new URL('./data/headphones-inventory.json', import.meta.url),
    JSON.stringify(inventory, null, 2),
  );

  console.log(`\nWrote ${inventory.length} products to lib/filter-sort/__tests__/data/headphones-inventory.json`);
  console.log('\nFull dump:');
  console.log(JSON.stringify(inventory, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
