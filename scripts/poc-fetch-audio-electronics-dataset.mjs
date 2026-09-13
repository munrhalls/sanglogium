// One-off data generator for the /poc/filter-sort/audio-electronics proof of
// concept (sang-logium-1xs.10; should-be list: docs/filters-sort/should-be-audio-electronics.md).
//
// Fetches real audio-electronics-category products from the live Sanity
// catalogue (identity fields only: _id, name, brand, price_data, image, slug,
// stock, _createdAt) via the same VFS key-resolution the production catalogue
// pages use, then enriches each with synthetic values for the 30 should-be
// fields that don't exist in the schema yet — same discipline as
// poc-fetch-headphones-dataset.mjs.
//
// KNOWN GAP (flagged to the human, sang-logium-1xs.10): the real catalogue's
// audio-electronics slice only carries amps/DACs/streamers — no turntables,
// receivers, preamps, or CD players exist as real products. Per the human's
// explicit decision, a slice of the fetched real rows is synthetic-relabeled
// into those categories (productCategory + domain fields overwritten),
// exactly mirroring the headphones POC's existing precedent of assigning
// fully synthetic category/enrichment fields regardless of a product's real
// sub-type. This means a handful of grid rows will show a real product name
// alongside a synthetic Product Category — e.g. a real DAC's name paired with
// a "Turntable" tag and Speed/Drive-Type filters — so every should-be group
// has at least a few real, filterable, linkable rows to demonstrate against.
//
// Deterministic (seeded PRNG, not Math.random()): re-running produces the same
// dataset, so the file only changes when this script changes.
//
// Run: node scripts/poc-fetch-audio-electronics-dataset.mjs

import { createClient } from 'next-sanity';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TARGET_COUNT = 80;
const OUTPUT_PATH = path.join(
  process.cwd(),
  'app',
  '(test)',
  'poc',
  'filter-sort',
  'audio-electronics',
  'dataset.json',
);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03',
  useCdn: false,
});

// ── Deterministic PRNG (mulberry32) ─────────────────────────────────────────
function mulberry32(seed) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
function rotate(index, arr) {
  return arr[index % arr.length];
}
function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function chance(rng, p) {
  return rng() < p;
}

// ── VFS key resolution (mirrors data/catalogue.ts, read directly off the
//    already-built index so this script has no dependency on Next/TS) ───────
async function resolveAudioElectronicsKeys() {
  const raw = await fs.readFile(path.join(process.cwd(), 'data', 'catalogue-index.json'), 'utf8');
  const index = JSON.parse(raw);
  const nodeId = index.slugToIdMap['audio-electronics'];
  if (!nodeId) throw new Error('Could not resolve "audio-electronics" in catalogue-index.json slugToIdMap');

  const result = new Set();
  const stack = [nodeId];
  while (stack.length) {
    const id = stack.pop();
    if (result.has(id)) continue;
    result.add(id);
    const children = index.slotMetadataMap[id]?.children || [];
    stack.push(...children);
  }
  return Array.from(result);
}

// ── Fetch real products ─────────────────────────────────────────────────────
async function fetchRealAudioElectronics(keys, limit) {
  const query = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(image.asset)] | order(_createdAt asc) [0...${limit}]{
    _id,
    name,
    brand->{ _id, name, slug },
    price_data,
    stock,
    reservedStock,
    "availableStock": stock - reservedStock,
    image{ asset->{ _id, metadata{ lqip, isOpaque } } },
    slug{ current },
    catalogueLocationKeys,
    _createdAt
  }`;
  return client.fetch(query, { keys });
}

// ── Enrichment ───────────────────────────────────────────────────────────────

// Weighted so amps/DACs/streamers dominate (matching the real catalogue's
// actual composition) while every category still gets enough rows to
// demonstrate its own domain-gated facet group. See file header re: the
// turntable/receiver/preamp/CD-player gap.
const PRODUCT_CATEGORIES_WEIGHTED = [
  ...Array(5).fill('integrated-amp'),
  ...Array(3).fill('power-amp'),
  ...Array(3).fill('dac'),
  ...Array(3).fill('network-streamer'),
  'preamp', 'preamp',
  'av-receiver', 'av-receiver',
  'stereo-receiver',
  'cd-player', 'cd-player',
  'turntable', 'turntable', 'turntable',
];
const AMP_CATEGORIES = ['integrated-amp', 'power-amp', 'preamp', 'av-receiver', 'stereo-receiver'];
const DIGITAL_SOURCE_CATEGORIES = ['dac', 'network-streamer', 'cd-player'];

const CONNECTIVITY_WEIGHTED = [
  ...Array(5).fill('wired'),
  'bluetooth', 'bluetooth',
  'wifi', 'wifi', 'wifi',
  'wired-wireless',
];

const AMP_TOPOLOGIES = ['tube', 'solid-state', 'solid-state', 'solid-state', 'hybrid', 'class-d'];
const CHANNEL_COUNTS = ['2.0', '2.0', '2.1', '5.1', '7.1', '7.1.4'];
const INPUT_TYPE_BUNDLES = [
  ['rca', 'usb'],
  ['rca', 'xlr', 'usb', 'optical'],
  ['rca', 'phono', 'usb'],
  ['rca', 'xlr', 'optical', 'coaxial', 'usb'],
  ['hdmi-earc', 'optical', 'coaxial', 'bluetooth'],
  ['rca', 'ethernet', 'usb'],
];
const OUTPUT_TYPE_BUNDLES = [
  ['speaker-terminals'],
  ['speaker-terminals', 'pre-out'],
  ['speaker-terminals', 'headphone-jack'],
  ['pre-out', 'subwoofer-out'],
  ['speaker-terminals', 'pre-out', 'subwoofer-out', 'headphone-jack'],
];

const DSD_SUPPORT_WEIGHTED = [...Array(4).fill('none'), 'dsd64', 'dsd64', 'dsd128', 'dsd256-plus'];
const DAC_CHIPSETS = ['ess-sabre', 'ess-sabre', 'akm', 'cirrus-logic', 'r2r-ladder'];
const STREAMING_PLATFORM_BUNDLES = [
  ['airplay2', 'chromecast', 'spotify-connect'],
  ['airplay2', 'tidal-connect', 'roon-ready'],
  ['chromecast', 'spotify-connect', 'dlna'],
  ['roon-ready', 'dlna'],
  ['airplay2', 'chromecast', 'spotify-connect', 'tidal-connect', 'roon-ready'],
];
const DIGITAL_INPUT_BUNDLES = [
  ['usb', 'optical'],
  ['usb', 'optical', 'coaxial'],
  ['usb', 'coaxial', 'i2s'],
  ['usb', 'optical', 'coaxial', 'aes-ebu'],
];

const DRIVE_TYPES = ['belt-drive', 'belt-drive', 'direct-drive', 'idler-wheel'];
const TURNTABLE_OPERATIONS = ['manual', 'manual', 'automatic', 'semi-automatic'];
const SPEED_BUNDLES = [['33'], ['33', '45'], ['33', '45', '78']];

const BLUETOOTH_CODEC_BUNDLES = [
  ['sbc', 'aac'],
  ['sbc', 'aac', 'aptx'],
  ['sbc', 'aptx', 'aptx-hd'],
  ['sbc', 'aac', 'ldac'],
];
const VOICE_ASSISTANT_BUNDLES = [[], [], ['alexa'], ['google-assistant'], ['alexa', 'google-assistant']];

const FINISHES = ['Matte Black', 'Silver', 'Walnut', 'Champagne', 'Graphite'];
const COUNTRIES = ['Japan', 'UK', 'USA', 'China', 'Germany', 'Denmark'];

const CONDITIONS_WEIGHTED = [
  ...Array(13).fill('new'),
  'open-box', 'open-box', 'b-stock', 'b-stock', 'demo', 'used', 'refurbished',
];
const AWARDS_WEIGHTED = [
  ...Array(9).fill(null),
  ['award-winner'], ['editors-choice'], ['award-winner', 'editors-choice'],
];
const AVAILABILITY_WEIGHTED = [...Array(7).fill('in-stock'), 'preorder', 'preorder', 'special-order'];

function enrichOne(product, index, total, rng) {
  const productCategory = rotate(index, PRODUCT_CATEGORIES_WEIGHTED);
  const isAmp = AMP_CATEGORIES.includes(productCategory);
  const isDigitalSource = DIGITAL_SOURCE_CATEGORIES.includes(productCategory);
  const isTurntable = productCategory === 'turntable';

  let connectivity = rotate(index + 1, CONNECTIVITY_WEIGHTED);
  if (isTurntable) connectivity = chance(rng, 0.3) ? 'bluetooth' : 'wired';
  const isWireless = connectivity !== 'wired';

  // Amplification fields — populated only for amp/receiver categories.
  const amplifierTopology = isAmp ? rotate(index + 2, AMP_TOPOLOGIES) : null;
  const powerOutputW = isAmp ? randInt(rng, 20, 500) : null;
  const channelCount = isAmp && productCategory !== 'preamp' ? rotate(index + 3, CHANNEL_COUNTS) : null;
  const inputTypes = isAmp ? pick(rng, INPUT_TYPE_BUNDLES) : isDigitalSource ? ['usb', 'optical'] : [];
  const outputTypes = isAmp ? pick(rng, OUTPUT_TYPE_BUNDLES) : [];
  const phonoStage = isAmp && chance(rng, 0.3);
  const triggerReady = isAmp && chance(rng, 0.4);
  const remoteIncluded = isAmp ? chance(rng, 0.85) : chance(rng, 0.5);

  // Digital Source & Streaming — populated for dac/network-streamer/cd-player,
  // or any product with wifi connectivity (should-be.md's OR-gate).
  const digitalRelevant = isDigitalSource || connectivity === 'wifi';
  const maxSampleRateKhz = digitalRelevant ? pick(rng, [96, 192, 384, 768]) : null;
  const dsdSupport = digitalRelevant ? pick(rng, DSD_SUPPORT_WEIGHTED) : 'none';
  const hiResCert = digitalRelevant && chance(rng, 0.5);
  const dacChipsetFamily = productCategory === 'dac' || chance(rng, 0.3) ? pick(rng, DAC_CHIPSETS) : null;
  const streamingPlatforms = connectivity === 'wifi' ? pick(rng, STREAMING_PLATFORM_BUNDLES) : [];
  const networkConnection = connectivity === 'wifi' ? 'wifi' : connectivity === 'wired-wireless' ? 'ethernet' : null;
  const digitalInputs = digitalRelevant ? pick(rng, DIGITAL_INPUT_BUNDLES) : [];

  // Turntables & Vinyl — populated only for productCategory === 'turntable'.
  const driveType = isTurntable ? pick(rng, DRIVE_TYPES) : null;
  const turntableOperation = isTurntable ? pick(rng, TURNTABLE_OPERATIONS) : null;
  const speedsSupported = isTurntable ? pick(rng, SPEED_BUNDLES) : [];
  const phonoPreampBuiltIn = isTurntable && chance(rng, 0.5);
  const cartridgeIncluded = isTurntable && chance(rng, 0.6);
  const digitalOutput = isTurntable && chance(rng, 0.25);

  // Connectivity & Wireless — meaningful only once connectivity is non-wired.
  const bluetoothCodecs = isWireless ? pick(rng, BLUETOOTH_CODEC_BUNDLES) : [];
  const voiceAssistants = connectivity === 'wifi' ? pick(rng, VOICE_ASSISTANT_BUNDLES) : [];
  const multiroomSupport = connectivity === 'wifi' && chance(rng, 0.5);

  const finish = rotate(index + 4, FINISHES);
  const rackMountable = isAmp && chance(rng, 0.3);
  const countryOfManufacture = rotate(index + 5, COUNTRIES);

  const rating = randInt(rng, 34, 50) / 10;
  const ratingCount = chance(rng, 0.08) ? randInt(rng, 2, 6) : randInt(rng, 20, 2200);
  const awards = pick(rng, AWARDS_WEIGHTED) ?? [];
  const condition = pick(rng, CONDITIONS_WEIGHTED);
  const availability = pick(rng, AVAILABILITY_WEIGHTED);

  const onSale = chance(rng, 0.3);
  const clearance = condition !== 'new' && chance(rng, 0.4);
  const deals = [...(onSale ? ['on-sale'] : []), ...(clearance ? ['clearance'] : [])];
  const discountPercent = deals.length ? randInt(rng, 10, 50) : null;

  const isNewArrival = index >= total * 0.85;
  const inStockOnly = (product.stock ?? 0) - (product.reservedStock ?? 0) > 0;

  return {
    ...product,
    availableStock: (product.stock ?? 0) - (product.reservedStock ?? 0),

    rating,
    ratingCount,
    awards,
    condition,
    availability,
    inStockOnly,
    deals,
    discountPercent,
    isNewArrival,

    productCategory,
    connectivity,

    amplifierTopology,
    powerOutputW,
    channelCount,
    inputTypes,
    outputTypes,
    phonoStage,
    triggerReady,
    remoteIncluded,

    maxSampleRateKhz,
    dsdSupport,
    hiResCert,
    dacChipsetFamily,
    streamingPlatforms,
    networkConnection,
    digitalInputs,

    driveType,
    turntableOperation,
    speedsSupported,
    phonoPreampBuiltIn,
    cartridgeIncluded,
    digitalOutput,

    bluetoothCodecs,
    voiceAssistants,
    multiroomSupport,

    finish,
    rackMountable,
    countryOfManufacture,

    featuredPriority: randInt(rng, 0, 100),
    popularity: randInt(rng, 0, 100),
  };
}

function reportCoverage(dataset) {
  const fields = ['productCategory', 'connectivity', 'amplifierTopology', 'dsdSupport', 'driveType', 'condition', 'availability'];
  console.log('\n📊 Facet coverage (distinct values present / option count):');
  for (const field of fields) {
    const distinct = new Set(dataset.map((p) => p[field]));
    console.log(`   ${field.padEnd(20)} ${distinct.size} distinct — ${[...distinct].join(', ')}`);
  }
  const amps = dataset.filter((p) => AMP_CATEGORIES.includes(p.productCategory));
  const digitalSources = dataset.filter((p) => DIGITAL_SOURCE_CATEGORIES.includes(p.productCategory));
  const turntables = dataset.filter((p) => p.productCategory === 'turntable');
  const wireless = dataset.filter((p) => p.connectivity !== 'wired');
  console.log(`   amp/receiver rows      ${amps.length}/${dataset.length}`);
  console.log(`   digital-source rows    ${digitalSources.length}/${dataset.length}`);
  console.log(`   turntable rows         ${turntables.length}/${dataset.length} (synthetic-relabeled — see file header)`);
  console.log(`   wireless-gated rows    ${wireless.length}/${dataset.length}`);
}

async function main() {
  console.log('🔊 Building /poc/filter-sort/audio-electronics dataset...');

  const keys = await resolveAudioElectronicsKeys();
  console.log(`   Resolved ${keys.length} audio-electronics VFS key(s).`);

  const raw = await fetchRealAudioElectronics(keys, TARGET_COUNT);
  if (!raw.length) {
    throw new Error('No real audio-electronics products returned from Sanity — check .env.local Sanity credentials and the audio-electronics VFS category.');
  }
  console.log(`   Fetched ${raw.length} real product(s) from the live catalogue (target ${TARGET_COUNT}).`);

  const rng = mulberry32(20260913);
  const dataset = raw.map((p, i) => enrichOne(p, i, raw.length, rng));

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(dataset, null, 2));
  console.log(`✅ Wrote ${dataset.length} enriched products to ${path.relative(process.cwd(), OUTPUT_PATH)}`);

  reportCoverage(dataset);
}

main().catch((error) => {
  console.error('❌ Failed:', error);
  process.exit(1);
});
