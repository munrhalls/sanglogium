// One-off data generator for the /poc/filter-sort/accessories proof of
// concept (sang-logium-1xs.11; should-be list: sang-logium-1xs.5 —
// docs/filters-sort/should-be-accessories.md).
//
// Fetches real accessories-category products from the live Sanity catalogue
// (identity fields only: _id, name, brand, price_data, image, slug, stock,
// _createdAt) via the same VFS key-resolution the production catalogue pages
// use, then enriches each with synthetic values for the should-be-accessories.md
// facets that don't exist in the schema yet. Real identity fields mean links,
// basket, wishlist and the LQIP image reveal all work against this dataset
// unmodified.
//
// Deterministic (seeded PRNG, not Math.random()): re-running produces the same
// dataset, so the file only changes when this script changes.
//
// Run: node scripts/poc-fetch-accessories-dataset.mjs

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
  'accessories',
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
async function resolveAccessoriesKeys() {
  const raw = await fs.readFile(path.join(process.cwd(), 'data', 'catalogue-index.json'), 'utf8');
  const index = JSON.parse(raw);
  const nodeId = index.slugToIdMap['accessories'];
  if (!nodeId) throw new Error('Could not resolve "accessories" in catalogue-index.json slugToIdMap');

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
async function fetchRealAccessories(keys, limit) {
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
// should-be-accessories.md item 9 — gates every domain-specific group below.
const ACCESSORY_CATEGORIES = [
  'cables-interconnects',
  'stands-isolation',
  'racks-furniture',
  'power',
  'cases-storage',
  'cleaning-maintenance',
  'replacement-parts',
  'adapters-converters',
  'room-acoustic-treatment',
];
const COMPATIBLE_PRODUCT_TYPES = ['headphone', 'speaker', 'turntable', 'amplifier-source', 'universal'];

// Cables & Interconnects (11-15)
const CABLE_FUNCTIONS = ['interconnect-rca-xlr', 'speaker-cable', 'digital', 'power-mains', 'phono'];
const TERMINATION_TYPES = ['rca', 'xlr', 'banana-plug', 'spade', 'bnc', '3.5mm', '2.5mm', '4.4mm', 'mini-to-rca'];
const CONDUCTOR_MATERIALS = ['copper-ofc', 'silver', 'silver-plated-copper'];

// Stands, Isolation & Furniture (16-19)
const FURNITURE_TYPES = ['speaker-stand', 'equipment-rack-shelf', 'isolation-platform-feet-pucks', 'turntable-wall-shelf', 'wall-mount'];
const FURNITURE_MATERIALS = ['wood', 'metal', 'acrylic', 'composite-mdf'];

// Power (20-22)
const POWER_PRODUCT_TYPES = ['conditioner', 'surge-protector', 'power-distributor', 'battery-ups-backup', 'power-cable'];
const POWER_CONNECTOR_TYPES = ['nema-5-15', 'iec-c13', 'iec-c15', '20-amp'];

// Cleaning & Maintenance (23-24)
const CLEANING_PRODUCT_TYPES = ['record-cleaning-fluid', 'record-cleaning-machine', 'stylus-brush-cleaner', 'carbon-fiber-brush', 'anti-static-gun', 'demagnetizer', 'screen-lens-cloth'];
const FORMAT_COMPATIBILITIES = ['vinyl', 'cd', 'stylus-cartridge', 'optical-lens'];

// Replacement Parts (25-26)
const PART_TYPES = ['ear-pads-cushions', 'ear-tips', 'phono-cartridge-stylus', 'drive-belt', 'remote-control', 'dust-cover', 'fuses', 'vacuum-tubes-valves'];
const COMPATIBLE_MODELS_SAMPLE = ['Focal Utopia', 'Sennheiser HD 800S', 'Audio-Technica AT-LP120', 'Universal Fit', 'Sony WH-1000XM5'];

// Adapters & Converters (27)
const ADAPTER_FUNCTIONS = ['bluetooth-transmitter-receiver', 'impedance-attenuator-adapter', 'connector-adapter', 'standalone-phono-preamp', 'usb-dac-dongle'];

// Room Acoustic Treatment (28-29)
const TREATMENT_TYPES = ['acoustic-panel', 'bass-trap', 'diffuser', 'isolation-pad'];
const MOUNTINGS = ['wall', 'ceiling', 'freestanding'];

const CONDITIONS_WEIGHTED = [
  ...Array(13).fill('new'),
  'open-box', 'open-box', 'b-stock', 'b-stock', 'demo', 'used', 'refurbished',
];
const AWARDS_WEIGHTED = [
  ...Array(9).fill(null),
  ['award-winner'], ['editors-choice'], ['award-winner', 'editors-choice'],
];
const AVAILABILITY_WEIGHTED = [...Array(7).fill('in-stock'), 'preorder', 'preorder', 'interest-check'];

function enrichCablesGroup(rng, index) {
  return {
    cableFunction: rotate(index, CABLE_FUNCTIONS),
    terminationType: rotate(index + 1, TERMINATION_TYPES),
    lengthM: randFloat(rng, 0.5, 10, 1),
    conductorMaterial: rotate(index + 2, CONDUCTOR_MATERIALS),
    balanced: chance(rng, 0.4),
  };
}
function enrichStandsGroup(rng, index) {
  return {
    furnitureType: rotate(index, FURNITURE_TYPES),
    material: rotate(index + 1, FURNITURE_MATERIALS),
    adjustableHeight: chance(rng, 0.4),
    weightCapacityKg: randInt(rng, 5, 200),
  };
}
function enrichPowerGroup(rng, index) {
  return {
    powerProductType: rotate(index, POWER_PRODUCT_TYPES),
    outletCount: randInt(rng, 1, 12),
    connectorType: rotate(index + 1, POWER_CONNECTOR_TYPES),
  };
}
function enrichCleaningGroup(index) {
  return {
    cleaningProductType: rotate(index, CLEANING_PRODUCT_TYPES),
    formatCompatibility: rotate(index + 1, FORMAT_COMPATIBILITIES),
  };
}
function enrichReplacementPartsGroup(index) {
  return {
    partType: rotate(index, PART_TYPES),
    compatibleModel: rotate(index + 1, COMPATIBLE_MODELS_SAMPLE),
  };
}
function enrichAdaptersGroup(index) {
  return { adapterFunction: rotate(index, ADAPTER_FUNCTIONS) };
}
function enrichRoomAcousticGroup(index) {
  return {
    treatmentType: rotate(index, TREATMENT_TYPES),
    mounting: rotate(index + 1, MOUNTINGS),
  };
}

// All domain-specific fields, defaulted to null so every product has a
// stable shape regardless of which single group it belongs to (mirrors
// headphones POC's fitType/cableLengthM/batteryLifeHours null-when-N/A pattern).
function nullDomainFields() {
  return {
    cableFunction: null, terminationType: null, lengthM: null, conductorMaterial: null, balanced: null,
    furnitureType: null, material: null, adjustableHeight: null, weightCapacityKg: null,
    powerProductType: null, outletCount: null, connectorType: null,
    cleaningProductType: null, formatCompatibility: null,
    partType: null, compatibleModel: null,
    adapterFunction: null,
    treatmentType: null, mounting: null,
  };
}

function enrichOne(product, index, total, rng) {
  const accessoryCategory = rotate(index, ACCESSORY_CATEGORIES);
  const compatibleProductType = rotate(index + 1, COMPATIBLE_PRODUCT_TYPES);
  // Per-category counter (not the global dataset index) for domain-field
  // rotation — with 9 accessory categories, reusing `index` for a
  // same-length domain enum would always land on the same remainder.
  const categoryIndex = Math.floor(index / ACCESSORY_CATEGORIES.length);

  let domainFields = nullDomainFields();
  switch (accessoryCategory) {
    case 'cables-interconnects':
      domainFields = { ...domainFields, ...enrichCablesGroup(rng, categoryIndex) };
      break;
    case 'stands-isolation':
    case 'racks-furniture':
      domainFields = { ...domainFields, ...enrichStandsGroup(rng, categoryIndex) };
      break;
    case 'power':
      domainFields = { ...domainFields, ...enrichPowerGroup(rng, categoryIndex) };
      break;
    case 'cleaning-maintenance':
      domainFields = { ...domainFields, ...enrichCleaningGroup(categoryIndex) };
      break;
    case 'replacement-parts':
      domainFields = { ...domainFields, ...enrichReplacementPartsGroup(categoryIndex) };
      break;
    case 'adapters-converters':
      domainFields = { ...domainFields, ...enrichAdaptersGroup(categoryIndex) };
      break;
    case 'room-acoustic-treatment':
      domainFields = { ...domainFields, ...enrichRoomAcousticGroup(categoryIndex) };
      break;
    case 'cases-storage':
      // should-be-accessories.md has no dedicated domain group for
      // Cases & Storage/Transport beyond Accessory Category itself.
      break;
    default:
      break;
  }

  const rating = randFloat(rng, 3.4, 5.0, 1);
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
    inStockOnly,
    deals,
    discountPercent,
    isNewArrival,
    availability,

    accessoryCategory,
    compatibleProductType,

    ...domainFields,

    featuredPriority: randInt(rng, 0, 100),
    popularity: randInt(rng, 0, 100),
  };
}

function reportCoverage(dataset) {
  const fields = ['accessoryCategory', 'compatibleProductType', 'condition', 'availability', 'terminationType', 'furnitureType', 'powerProductType', 'cleaningProductType', 'partType', 'adapterFunction', 'treatmentType'];
  console.log('\n📊 Facet coverage (distinct values present / option count):');
  for (const field of fields) {
    const distinct = new Set(dataset.map((p) => p[field]).filter((v) => v !== null));
    console.log(`   ${field.padEnd(22)} ${distinct.size} distinct — ${[...distinct].join(', ')}`);
  }
  for (const cat of ACCESSORY_CATEGORIES) {
    console.log(`   ${cat.padEnd(22)} ${dataset.filter((p) => p.accessoryCategory === cat).length} product(s)`);
  }
}

async function main() {
  console.log('🔌 Building /poc/filter-sort/accessories dataset...');

  const keys = await resolveAccessoriesKeys();
  console.log(`   Resolved ${keys.length} accessories VFS key(s).`);

  const raw = await fetchRealAccessories(keys, TARGET_COUNT);
  if (!raw.length) {
    throw new Error('No real accessories products returned from Sanity — check .env.local Sanity credentials and the accessories VFS category.');
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
