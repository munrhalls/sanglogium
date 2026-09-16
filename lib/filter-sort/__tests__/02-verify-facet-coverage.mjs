// sang-logium-ajf, step 2 — every product in the step-1 dump must carry a key
// (value or explicit null) for every filter field. Loads the file step 1
// wrote; no network call, no repo imports.
//
// Run: node lib/filter-sort/__tests__/02-verify-facet-coverage.mjs

import { readFileSync } from 'node:fs';

const FIELD_PATHS = [
  'price', 'brand', 'inStock',
  'awards', 'productCategory', 'wearingStyle', 'acousticDesign', 'fitType',
  'connectivity', 'portable', 'soundSignature', 'impedanceOhms', 'sensitivityDbMw',
  'requiresAmplifier', 'microphone', 'cableTermination', 'detachableCable',
  'cableLengthM', 'foldable', 'ipxRating', 'bluetoothCodecs', 'anc',
  'driverType', 'driverConfigBucket',
  'freqResponseHzMin', 'freqResponseHzMax',
  'batteryLifeHoursAncOff', 'batteryLifeHoursAncOn',
  'priceCentsResolved', 'inStockResolved',
];

const inventory = JSON.parse(
  readFileSync(new URL('./data/headphones-inventory.json', import.meta.url), 'utf8'),
);

let failures = 0;
for (const product of inventory) {
  for (const field of FIELD_PATHS) {
    if (!(field in product)) {
      console.log(`FAIL ${product._id} (${product.name}): missing key "${field}"`);
      failures++;
    }
  }
}

console.log(`\nChecked ${inventory.length} products x ${FIELD_PATHS.length} fields = ${inventory.length * FIELD_PATHS.length} keys.`);
console.log(failures === 0 ? 'PASS: every product carries every filter field key (value or explicit null).' : `FAIL: ${failures} missing keys.`);
process.exit(failures === 0 ? 0 : 1);
