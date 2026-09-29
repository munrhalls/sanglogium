// sang-logium-ttn, step 2 -- every product in the step-1 dump must carry a
// key (value or explicit null) for every filter field (mirrors
// lib/filter-sort/__tests__/02-verify-facet-coverage.mjs), PLUS a
// vocab-conformance check against the exact valueVocab arrays declared in
// lib/catalogue/facetMap.ts for audio-electronics enum/multi/boolean
// fields. The latter is new versus the headphones script: step 1's raw
// dump already surfaced live "inputs" values ("xlr-balanced",
// "phono-mm-mc") absent from facetMap's declared vocab for that field --
// exactly the shape of bug this whole issue exists to catch (a value the UI
// filter can never select, or a predicate mismatch). Loads the file step 1
// wrote; no network call, no repo imports (vocab lists copied by hand from
// facetMap.ts so this oracle stays independent of the code under test).
//
// Run: node lib/filter-sort/audio-electronics/__tests__/ae-02-verify-facet-coverage-and-vocab.mjs

import { readFileSync } from 'node:fs';

const FIELD_PATHS = [
  'price', 'brand', 'inStock', 'category',
  'deviceType', 'formFactor', 'amplification', 'dacIncluded', 'balancedOutput',
  'inputs', 'outputs',
  'awards', 'condition', 'dealsDiscount', 'newArrival',
  'priceCentsResolved', 'inStockResolved',
];

// Copied by hand from lib/catalogue/facetMap.ts (categories including
// "audio-electronics") as of 2026-09-28, POST sang-logium-ttn fix (inputs
// and amplification extended to match productType.ts's own options.list).
// "awards" is an open slug vocab (valueVocab: ['<award-slug>']) so it is
// excluded from this check.
const VOCAB = {
  deviceType: { kind: 'enum', values: ['integrated-amplifier', 'power-amplifier', 'preamplifier', 'av-surround-receiver', 'stereo-receiver', 'dac', 'network-streamer', 'cd-player-transport', 'turntable'] },
  formFactor: { kind: 'enum', values: ['desktop', 'portable', 'dongle'] },
  amplification: { kind: 'enum', values: ['solid-state', 'tube', 'hybrid', 'class-d'] },
  dacIncluded: { kind: 'boolean' },
  balancedOutput: { kind: 'boolean' },
  inputs: { kind: 'multi', values: ['usb', 'optical', 'coaxial', 'rca', 'bluetooth', 'xlr-balanced', 'phono-mm-mc', 'hdmi-earc', 'ethernet-lan', 'i2s-iis', 'aes-ebu'] },
  outputs: { kind: 'multi', values: ['speaker-terminals', 'pre-out-rca', 'pre-out-xlr', 'headphone-jack', 'subwoofer-out'] },
  condition: { kind: 'enum', values: ['new', 'open-box', 'refurbished'] },
  dealsDiscount: { kind: 'enum', values: ['none', 'sale', 'clearance'] },
  newArrival: { kind: 'boolean' },
};

const inventory = JSON.parse(
  readFileSync(new URL('./data/audio-electronics-inventory.json', import.meta.url), 'utf8'),
);

let missingKeys = 0;
for (const product of inventory) {
  for (const field of FIELD_PATHS) {
    if (!(field in product)) {
      console.log(`FAIL missing-key ${product._id} (${product.name}): "${field}"`);
      missingKeys++;
    }
  }
}

let vocabViolations = 0;
const violationsByField = {};
const duplicatesByField = {};
for (const product of inventory) {
  for (const [field, spec] of Object.entries(VOCAB)) {
    const value = product[field];
    if (value == null) continue;
    if (spec.kind === 'boolean') {
      if (typeof value !== 'boolean') {
        console.log(`FAIL vocab ${product._id} (${product.name}): "${field}" = ${JSON.stringify(value)} is not boolean`);
        vocabViolations++;
        (violationsByField[field] ??= new Set()).add(JSON.stringify(value));
      }
      continue;
    }
    const values = spec.kind === 'multi' ? value : [value];
    if (spec.kind === 'multi' && Array.isArray(value)) {
      const seen = new Set();
      for (const v of value) {
        if (seen.has(v)) {
          console.log(`FAIL duplicate-value ${product._id} (${product.name}): "${field}" contains "${v}" more than once`);
          (duplicatesByField[field] ??= new Set()).add(v);
        }
        seen.add(v);
      }
    }
    for (const v of values) {
      if (!spec.values.includes(v)) {
        console.log(`FAIL vocab ${product._id} (${product.name}): "${field}" = ${JSON.stringify(v)} not in declared vocab [${spec.values.join(', ')}]`);
        vocabViolations++;
        (violationsByField[field] ??= new Set()).add(v);
      }
    }
  }
}

console.log(`\nChecked ${inventory.length} products x ${FIELD_PATHS.length} fields = ${inventory.length * FIELD_PATHS.length} keys for coverage.`);
console.log(`Checked ${inventory.length} products across ${Object.keys(VOCAB).length} enum/multi/boolean fields for vocab conformance.`);

if (Object.keys(violationsByField).length) {
  console.log('\nOut-of-vocab values found, by field:');
  for (const [field, set] of Object.entries(violationsByField)) {
    console.log(`  ${field}: ${[...set].join(', ')}`);
  }
}
if (Object.keys(duplicatesByField).length) {
  console.log('\nDuplicate array entries found, by field:');
  for (const [field, set] of Object.entries(duplicatesByField)) {
    console.log(`  ${field}: ${[...set].join(', ')}`);
  }
}

console.log(
  missingKeys === 0 && vocabViolations === 0
    ? '\nPASS: every product carries every filter field key, and every enum/multi/boolean value is in the declared facetMap.ts vocab.'
    : `\nFAIL: ${missingKeys} missing keys, ${vocabViolations} out-of-vocab values.`,
);
process.exit(missingKeys === 0 && vocabViolations === 0 ? 0 : 1);
