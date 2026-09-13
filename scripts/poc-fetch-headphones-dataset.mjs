// One-off data generator for the /poc/filter-sort/headphones proof of concept
// (sang-logium-1xs.1 — should-be list; see docs/filters-sort/should-be.md).
//
// Fetches real headphones-category products from the live Sanity catalogue
// (identity fields only: _id, name, brand, price_data, image, slug, stock,
// _createdAt) via the same VFS key-resolution the production catalogue pages
// use, then enriches each with synthetic values for the 20 should-be.md fields
// that don't exist in the schema yet. Real identity fields mean links, basket,
// wishlist and the LQIP image reveal all work against this dataset unmodified.
//
// Deterministic (seeded PRNG, not Math.random()): re-running produces the same
// dataset, so the file only changes when this script changes.
//
// Run: node scripts/poc-fetch-headphones-dataset.mjs

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
  'headphones',
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
function randFloat(rng, min, max, decimals = 1) {
  const v = rng() * (max - min) + min;
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}
function chance(rng, p) {
  return rng() < p;
}

// ── VFS key resolution (mirrors data/catalogue.ts, read directly off the
//    already-built index so this script has no dependency on Next/TS) ───────
async function resolveHeadphonesKeys() {
  const raw = await fs.readFile(path.join(process.cwd(), 'data', 'catalogue-index.json'), 'utf8');
  const index = JSON.parse(raw);
  const nodeId = index.slugToIdMap['headphones'];
  if (!nodeId) throw new Error('Could not resolve "headphones" in catalogue-index.json slugToIdMap');

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
async function fetchRealHeadphones(keys, limit) {
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

const CATEGORIES = ['over-ear', 'iem', 'on-ear', 'true-wireless'];
const SOUND_SIGNATURES = ['neutral', 'warm', 'bright', 'dark', 'v-shaped', 'basshead', 'mid-forward', 'harman-like'];
const CABLE_TERMINATIONS = ['3.5mm', '2.5mm-balanced', '4.4mm-balanced', '4-pin-xlr', '6.35mm'];
const IPX_RATINGS = ['none', 'ipx4', 'ipx5', 'ipx7', 'ip67'];
const CODECS = ['sbc', 'aac', 'aptx', 'aptx-hd', 'aptx-adaptive', 'ldac', 'lc3'];
const CODEC_BUNDLES = [
  ['sbc', 'aac'],
  ['sbc', 'aac', 'aptx'],
  ['sbc', 'aptx', 'aptx-hd'],
  ['sbc', 'aac', 'ldac'],
  ['sbc', 'aptx-adaptive', 'ldac'],
  ['sbc', 'aac', 'lc3'],
];
const CONDITIONS_WEIGHTED = [
  ...Array(13).fill('new'),
  'open-box', 'open-box', 'b-stock', 'b-stock', 'demo', 'used', 'refurbished',
];
const AWARDS_WEIGHTED = [
  ...Array(9).fill(null),
  ['award-winner'], ['editors-choice'], ['award-winner', 'editors-choice'],
];
const AVAILABILITY_WEIGHTED = [...Array(7).fill('in-stock'), 'preorder', 'preorder', 'interest-check'];

// Driver types, weighted per category — IEMs skew BA/hybrid/dynamic; full-size
// skews dynamic/planar/electrostatic (the types that actually ship as ~40-50mm
// single elements per ear).
const DRIVER_TYPES_BY_CATEGORY = {
  'over-ear': ['dynamic', 'dynamic', 'planar-magnetic', 'planar-magnetic', 'electrostatic', 'dynamic'],
  'on-ear': ['dynamic', 'dynamic', 'planar-magnetic'],
  iem: ['dynamic', 'balanced-armature', 'balanced-armature', 'hybrid', 'hybrid', 'dynamic'],
  'true-wireless': ['dynamic', 'dynamic', 'hybrid', 'balanced-armature'],
};

/** should-be.md item 31's bucket vocabulary is IEM-shaped (single/multi-BA,
 *  hybrid, tribrid). For driver types with no natural "count" story
 *  (planar/electrostatic/AMT/bone-conduction/electret — one full-range element
 *  per ear), the closest available bucket is 'single-dynamic'; the true
 *  driver name still shows correctly in `driverConfigDetail`. */
function driverConfig(rng, driverType) {
  switch (driverType) {
    case 'dynamic':
      return { bucket: 'single-dynamic', detail: '1 × Dynamic' };
    case 'balanced-armature': {
      if (chance(rng, 0.4)) return { bucket: 'single-ba', detail: '1 × BA' };
      const n = pick(rng, [2, 4, 6]);
      return { bucket: 'multi-ba', detail: `${n} × BA` };
    }
    case 'hybrid': {
      if (chance(rng, 0.7)) {
        const combo = pick(rng, ['1DD + 2BA', '1DD + 4BA', '2DD + 4BA', '1DD + 1 Planar']);
        return { bucket: 'hybrid-config', detail: combo };
      }
      const combo = pick(rng, ['1DD + 4BA + 1EST', '1DD + 2BA + 1 Planar']);
      return { bucket: 'tribrid', detail: combo };
    }
    case 'planar-magnetic':
      return { bucket: 'single-dynamic', detail: '1 × Planar Magnetic' };
    case 'electrostatic':
      return { bucket: 'single-dynamic', detail: '1 × Electrostatic' };
    case 'amt':
      return { bucket: 'single-dynamic', detail: '1 × AMT / Ribbon' };
    case 'bone-conduction':
      return { bucket: 'single-dynamic', detail: '1 × Bone Conduction' };
    default:
      return { bucket: 'single-dynamic', detail: '1 × Electret' };
  }
}

function enrichOne(product, index, total, rng) {
  const category = rotate(index, CATEGORIES);
  const wearingStyle =
    category === 'iem' || category === 'true-wireless' ? 'in-ear' : category === 'on-ear' ? 'on-ear' : 'over-ear';
  const isEarphone = category === 'iem' || category === 'true-wireless';

  const acousticDesign = isEarphone ? 'closed-back' : rotate(index, ['open-back', 'closed-back', 'semi-open']);
  const fitType = category === 'iem' ? rotate(index, ['universal', 'universal', 'custom']) : null;

  let connectivity;
  if (category === 'true-wireless') connectivity = 'true-wireless';
  else connectivity = rotate(index + 1, ['wired', 'wired', 'wireless', 'hybrid']);
  const isWireless = connectivity !== 'wired';

  const portable = isEarphone || chance(rng, category === 'over-ear' ? 0.25 : 0.6);

  const driverType = pick(rng, DRIVER_TYPES_BY_CATEGORY[category]);
  const { bucket: driverConfigBucket, detail: driverConfigDetail } = driverConfig(rng, driverType);

  // Impedance/sensitivity: correlate loosely with driver type (planar/electrostatic
  // run higher-impedance / lower-sensitivity — the "needs an amp" cluster).
  const hardToDrive = driverType === 'planar-magnetic' || driverType === 'electrostatic' || chance(rng, 0.2);
  const impedanceOhms = hardToDrive ? randInt(rng, 150, 600) : randInt(rng, 8, 149);
  const sensitivityDbMw = hardToDrive ? randInt(rng, 85, 98) : randInt(rng, 99, 124);
  const requiresAmplifier = impedanceOhms >= 150 || sensitivityDbMw <= 92;
  const bassExtensionHz = randInt(rng, 5, 60);

  const microphone = isWireless ? chance(rng, 0.85) : chance(rng, 0.25);
  const cableTermination = rotate(index + 2, CABLE_TERMINATIONS);
  const detachableCable = connectivity === 'true-wireless' ? false : chance(rng, 0.6);
  const cableLengthM = connectivity === 'true-wireless' ? null : randFloat(rng, 0.5, 3.5, 1);
  const foldable = isEarphone ? false : chance(rng, category === 'over-ear' ? 0.35 : 0.5);
  const ipxRating = isEarphone
    ? rotate(index + 3, ['none', 'ipx4', 'ipx5', 'ipx7', 'ip67'])
    : rotate(index + 3, ['none', 'none', 'none', 'ipx4']);

  const bluetoothCodecs = isWireless ? pick(rng, CODEC_BUNDLES) : [];
  const anc = !isWireless ? 'none' : rotate(index + 4, ['anc', 'anc', 'passive', 'none']);
  const batteryLifeHours = isWireless ? randInt(rng, 4, 70) : null;

  const rating = randFloat(rng, 3.4, 5.0, 1);
  // Deliberately varied review volume — including a few very-high-rating,
  // very-low-count outliers — so the weighted Customer Rating sort visibly
  // differs from a naive sort-by-average (should-be.md's explicit caution).
  const ratingCount = chance(rng, 0.08) ? randInt(rng, 2, 6) : randInt(rng, 20, 2200);
  const awards = pick(rng, AWARDS_WEIGHTED) ?? [];
  const condition = pick(rng, CONDITIONS_WEIGHTED);
  const availability = pick(rng, AVAILABILITY_WEIGHTED);

  const onSale = chance(rng, 0.3);
  const clearance = condition !== 'new' && chance(rng, 0.4);
  const deals = [...(onSale ? ['on-sale'] : []), ...(clearance ? ['clearance'] : [])];
  const discountPercent = deals.length ? randInt(rng, 10, 50) : null;

  // Newest ~15% by real _createdAt (index 0 = oldest per the fetch's own
  // ascending order) are flagged as new arrivals.
  const isNewArrival = index >= total * 0.85;

  const inStockOnly = (product.stock ?? 0) - (product.reservedStock ?? 0) > 0;

  return {
    ...product,
    availableStock: (product.stock ?? 0) - (product.reservedStock ?? 0),

    rating,
    ratingCount,
    awards,
    condition,
    inStockOnly,
    deals,
    discountPercent,
    isNewArrival,
    availability,

    productCategory: category,
    wearingStyle,
    acousticDesign,
    fitType,
    connectivity,
    portable,

    soundSignature: rotate(index + 5, SOUND_SIGNATURES),
    impedanceOhms,
    sensitivityDbMw,
    bassExtensionHz,
    requiresAmplifier,

    microphone,
    cableTermination,
    detachableCable,
    cableLengthM,
    foldable,
    ipxRating,

    bluetoothCodecs,
    anc,
    batteryLifeHours,

    driverType,
    driverConfigBucket,
    driverConfigDetail,

    featuredPriority: randInt(rng, 0, 100),
    popularity: randInt(rng, 0, 100),
  };
}

function reportCoverage(dataset) {
  const fields = [
    'productCategory', 'wearingStyle', 'acousticDesign', 'connectivity', 'soundSignature',
    'driverType', 'driverConfigBucket', 'condition', 'availability', 'ipxRating', 'anc', 'cableTermination',
  ];
  console.log('\n📊 Facet coverage (distinct values present / option count):');
  for (const field of fields) {
    const distinct = new Set(dataset.map((p) => p[field]));
    console.log(`   ${field.padEnd(18)} ${distinct.size} distinct — ${[...distinct].join(', ')}`);
  }
  const wireless = dataset.filter((p) => p.connectivity !== 'wired');
  const withAmp = dataset.filter((p) => p.requiresAmplifier);
  const withFit = dataset.filter((p) => p.fitType);
  console.log(`   wireless-gated rows   ${wireless.length}/${dataset.length}`);
  console.log(`   requiresAmplifier     ${withAmp.length}/${dataset.length}`);
  console.log(`   fitType populated     ${withFit.length}/${dataset.length} (IEMs only)`);
}

async function main() {
  console.log('🎧 Building /poc/filter-sort/headphones dataset...');

  const keys = await resolveHeadphonesKeys();
  console.log(`   Resolved ${keys.length} headphones VFS key(s).`);

  const raw = await fetchRealHeadphones(keys, TARGET_COUNT);
  if (!raw.length) {
    throw new Error('No real headphones products returned from Sanity — check .env.local Sanity credentials and the headphones VFS category.');
  }
  console.log(`   Fetched ${raw.length} real product(s) from the live catalogue (target ${TARGET_COUNT}).`);

  const rng = mulberry32(20260912);
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
