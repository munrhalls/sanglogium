// sang-logium-ttn, step 2 -- every product in the step-1 dump must carry a
// key (value or explicit null) for every filter field, PLUS a
// vocab-conformance check against the exact valueVocab arrays declared in
// features/product-filtering/config/facetMap.ts for audio-electronics enum/multi/boolean
// fields. The vocab check exists because step 1's raw
// dump already surfaced live "inputs" values ("xlr-balanced",
// "phono-mm-mc") absent from facetMap's declared vocab for that field --
// exactly the shape of bug this whole issue exists to catch (a value the UI
// filter can never select, or a predicate mismatch). Loads the file step 1
// wrote; no network call, no repo imports (vocab lists copied by hand from
// facetMap.ts so this oracle stays independent of the code under test).
//
// Run: node features/product-filtering/__tests__/proofs/ae-02-verify-facet-coverage-and-vocab.mjs

import { readFileSync } from 'node:fs';

const FIELD_PATHS = [
  'price', 'brand', 'inStock', 'category',
  'deviceType', 'formFactor', 'deviceConnectivity', 'bluetoothCodecs',
  'inputs', 'balancedOutput', 'amplification', 'dacIncluded',
  'dsdSupport', 'dacChipsetFamily', 'streamingPlatformSupport', 'condition',
  'priceCentsResolved', 'inStockResolved',
];

// Copied by hand from features/product-filtering/config/facetMap.ts (categories including
// "audio-electronics") as of 2026-09-29, POST the Turn-2 normalization:
// deviceType re-scoped to the 8 data-backed values, outputs/awards/
// dealsDiscount/newArrival dropped from the shipped facet set, the four
// digital/connections facets added, bluetoothCodecs shared with headphones.
const VOCAB = {
  deviceType: { kind: 'enum', values: ['headphone-amplifier', 'digital-audio-player', 'dac', 'network-streamer', 'preamplifier', 'integrated-amplifier', 'power-amplifier', 'cd-player-transport'] },
  formFactor: { kind: 'enum', values: ['desktop', 'portable', 'dongle'] },
  deviceConnectivity: { kind: 'enum', values: ['wired', 'bluetooth', 'wifi-networked', 'wired-wireless'] },
  bluetoothCodecs: { kind: 'multi', values: ['SBC', 'AAC', 'aptX', 'aptX HD', 'aptX Adaptive', 'aptX LL', 'LDAC', 'LC3'] },
  inputs: { kind: 'multi', values: ['usb', 'optical', 'coaxial', 'rca', 'bluetooth', 'xlr-balanced', 'phono-mm-mc', 'hdmi-earc', 'ethernet-lan', 'i2s-iis', 'aes-ebu'] },
  balancedOutput: { kind: 'boolean' },
  amplification: { kind: 'enum', values: ['solid-state', 'tube', 'hybrid', 'class-d'] },
  dacIncluded: { kind: 'boolean' },
  dsdSupport: { kind: 'enum', values: ['none', 'dsd64', 'dsd128', 'dsd256-plus'] },
  dacChipsetFamily: { kind: 'multi', values: ['ess-sabre', 'akm', 'cirrus-logic', 'r2r-ladder'] },
  streamingPlatformSupport: { kind: 'multi', values: ['airplay2', 'chromecast', 'spotify-connect', 'tidal-connect', 'roon-ready', 'dlna'] },
  condition: { kind: 'enum', values: ['new', 'open-box', 'refurbished'] },
};

const inventory = JSON.parse(
  readFileSync(new URL('../data/audio-electronics-inventory.json', import.meta.url), 'utf8'),
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
const scalarContainers = {};
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
    const values = spec.kind === 'multi' ? (Array.isArray(value) ? value : [value]) : [value];
    if (spec.kind === 'multi' && !Array.isArray(value)) {
      console.log(`WARN scalar-container ${product._id} (${product.name}): "${field}" = ${JSON.stringify(value)} stored as scalar, schema/facetMap declare array`);
      (scalarContainers[field] ??= new Set()).add(product._id);
    }
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
if (Object.keys(scalarContainers).length) {
  console.log('\nMulti fields stored as scalar (container-shape mismatch, values still checked):');
  for (const [field, set] of Object.entries(scalarContainers)) {
    console.log(`  ${field}: ${set.size} doc(s)`);
  }
}

console.log(
  missingKeys === 0 && vocabViolations === 0
    ? '\nPASS: every product carries every filter field key, and every enum/multi/boolean value is in the declared facetMap.ts vocab.'
    : `\nFAIL: ${missingKeys} missing keys, ${vocabViolations} out-of-vocab values.`,
);
process.exit(missingKeys === 0 && vocabViolations === 0 ? 0 : 1);
