const fs = require('fs');
const path = require('path');

// Load env so credentials are available for scripts that fetch from Sanity.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { createClient } = require('@sanity/client');

const BASE_DIR = __dirname;
const EXPORT_PATH = path.join(BASE_DIR, 'products-export.json');
const INDEX_PATH = path.join(__dirname, '..', '..', 'data', 'catalogue-index.json');
const FACET_MAP_PATH = path.join(BASE_DIR, 'facet-map.json');

const ROOT_SLUGS = {
  Headphones: 'headphones',
  'Audio Electronics': 'audio-electronics',
  Accessories: 'accessories',
};

const GROUPS = {
  headphones: ['wearingStyle', 'backDesign', 'driverType', 'connectivity'],
  'audio-electronics': ['formFactor', 'amplification', 'connectivity'],
  shared: [
    'price',
    'brand',
    'inStock',
    'category',
    'connector',
    'microphone',
    'noiseCancelling',
    'requiresAmplifier',
    'deviceType',
    'dacIncluded',
    'balancedOutput',
    'inputs',
    'outputs',
    'accessoryType',
    'connectorTermination',
    'compatibility',
  ],
  sort: ['featuredPriority'],
};

// Non-attribute fields that are derived from the product itself.
const DIRECT_FIELDS = new Set(['price', 'brand', 'inStock', 'category', 'featuredPriority']);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ── basic helpers ──

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getArg(name, args = process.argv) {
  return args.includes(name) || args.includes(`--${name}`);
}

function getArgValue(name, args = process.argv) {
  const long = `--${name}`;
  const idx = args.indexOf(long);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return undefined;
}

function getEnvFileMtime(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.statSync(filePath).mtime;
}

function daysAgo(mtime) {
  return (Date.now() - mtime.getTime()) / MS_PER_DAY;
}

// ── slugs / tokenisation ──

function normalizeSlug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function normalizeCompressed(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '')
    .replace(/\.+/g, '.');
}

const BOOLEAN_TRUTHY = new Set(['true', 'yes', '1']);
const BOOLEAN_FALSY = new Set(['false', 'no', '0']);

function isPlaceholderVocab(valueVocab) {
  return valueVocab.some((v) => v.startsWith('<') && v.endsWith('>'));
}

function tokenize(raw, { splitSpace, splitHyphen }) {
  const candidates = new Set();
  candidates.add(String(raw).trim());

  const separators = splitSpace ? /[,;|/\\()\\\s-]/g : /[,;|/\\()-]/g;

  const parts = String(raw)
    .split(separators)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const p of parts) candidates.add(p);

  if (splitSpace) {
    const tokens = String(raw)
      .split(/[,;|/\\()\\\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (let i = 0; i < tokens.length - 1; i++) {
      candidates.add(tokens[i] + ' ' + tokens[i + 1]);
    }
  }

  return [...candidates];
}

function splitCompatibility(raw) {
  if (!raw) return [];
  const parts = String(raw)
    .split(/(?:\s*,\s*|\s*;\s*|\s*\|\s*|\s*\/\s*|\s*\band\b\s*|\s*&\s*)/i)
    .map((s) => s.trim())
    .filter(Boolean);
  // If the split looks like a human product list, keep the parts.
  if (parts.length > 1 && parts.length <= 8 && parts.every((p) => p.length <= 60)) {
    return parts;
  }
  return [String(raw).trim()];
}

// ── source extraction from the product / overview fields ──

function findFirstFieldValue(product, candidates) {
  const all = [
    ...(product.overviewFields || []),
    ...(product.specifications || []),
  ];
  for (const item of all) {
    const title = (item.title || '').trim();
    if (candidates.some((c) => title.toLowerCase() === c.toLowerCase())) {
      const val = item.value;
      if (val !== undefined && val !== null) return String(val).trim();
    }
  }
  return null;
}

function buildIdToRoot() {
  const idx = loadJson(INDEX_PATH);
  const meta = idx.slotMetadataMap || {};
  const idToRoot = {};

  for (const [rootName, slug] of Object.entries(ROOT_SLUGS)) {
    const rootId = idx.slugToIdMap[slug];
    if (!rootId) continue;

    const queue = [rootId];
    const visited = new Set();
    while (queue.length) {
      const id = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);
      idToRoot[id] = rootName;

      const node = meta[id];
      if (node && Array.isArray(node.children)) {
        for (const child of node.children) {
          const childId = typeof child === 'string' ? child : child.id || child._key;
          if (childId) queue.push(childId);
        }
      }
    }
  }

  return idToRoot;
}

function productRootCategories(product, idToRoot) {
  const roots = new Set();
  for (const key of product.catalogueLocationKeys || []) {
    if (idToRoot[key]) roots.add(idToRoot[key]);
  }
  return [...roots];
}

const FIELD_EXTRACTORS = {
  price: (p) => (p.price !== undefined && p.price !== null ? String(p.price) : null),
  brand: (p) => (p.brandSlug ? p.brandSlug : null),
  inStock: (p) => {
    if (p.stock === undefined || p.stock === null) return null;
    const reserved = p.reservedStock || 0;
    return p.stock - reserved > 0 ? 'true' : 'false';
  },
  category: (p, idToRoot) => {
    const roots = productRootCategories(p, idToRoot);
    return roots.length ? roots.join(', ') : null;
  },
  wearingStyle: (p) => findFirstFieldValue(p, ['Wearing style']),
  backDesign: (p) => findFirstFieldValue(p, ['Back design', 'Cup style', 'Cup / back design']),
  driverType: (p) => findFirstFieldValue(p, ['Driver type', 'Driver Type']),
  connectivity: (p) => findFirstFieldValue(p, ['Connectivity']),
  connector: (p) => findFirstFieldValue(p, ['Connector', 'Connector / plug']),
  microphone: (p) => findFirstFieldValue(p, ['Microphone', 'Microphones']),
  noiseCancelling: (p) =>
    findFirstFieldValue(p, ['Noise cancelling', 'Noise canceling', 'ANC', 'Active noise cancelling']),
  requiresAmplifier: (p) =>
    findFirstFieldValue(p, ['Amp required', 'Requires amplifier', 'Amplifier required']),
  deviceType: (p) => findFirstFieldValue(p, ['Device type', 'Product type', 'Type']),
  formFactor: (p) => findFirstFieldValue(p, ['Form factor', 'Portability']),
  amplification: (p) => findFirstFieldValue(p, ['Amplifier type', 'Amplification']),
  dacIncluded: (p) => findFirstFieldValue(p, ['DAC included', 'DAC', 'Built-in DAC']),
  balancedOutput: (p) => findFirstFieldValue(p, ['Balanced output', 'Balanced', 'Balanced connection']),
  inputs: (p) => findFirstFieldValue(p, ['Inputs', 'Input']),
  outputs: (p) => findFirstFieldValue(p, ['Outputs', 'Output']),
  accessoryType: (p) => findFirstFieldValue(p, ['Accessory type', 'Type']),
  connectorTermination: (p) =>
    findFirstFieldValue(p, ['Connector / termination', 'Connector', 'Termination']),
  compatibility: (p) => findFirstFieldValue(p, ['Compatibility', 'Compatible with', 'Fits']),
};

// ── mappability to canonical facet values ──

function mappableValues(raw, facet, fieldName) {
  if (!raw) return { values: [], unmapped: [] };

  const type = facet.type;
  const valueVocab = facet.valueVocab || [];

  // Direct numeric / placeholder-backed fields.
  if (type === 'range') {
    const n = Number(raw);
    return { values: Number.isFinite(n) ? [n] : [], unmapped: Number.isFinite(n) ? [] : [raw] };
  }

  if (fieldName === 'compatibility' || (isPlaceholderVocab(valueVocab) && fieldName !== 'brand' && fieldName !== 'category')) {
    // compatibility is a placeholder multi field; split compounds into an array.
    return { values: splitCompatibility(raw), unmapped: [] };
  }

  if (type === 'boolean') {
    const compressed = normalizeCompressed(raw);
    const slug = normalizeSlug(raw);
    if (BOOLEAN_TRUTHY.has(compressed) || BOOLEAN_TRUTHY.has(slug)) {
      return { values: [true], unmapped: [] };
    }
    if (BOOLEAN_FALSY.has(compressed) || BOOLEAN_FALSY.has(slug)) {
      return { values: [false], unmapped: [] };
    }
    return { values: [], unmapped: [raw] };
  }

  const allowed = new Set();
  for (const v of valueVocab) {
    allowed.add(normalizeSlug(v));
    allowed.add(normalizeCompressed(v));
  }

  const isMulti = type === 'multi';
  const candidates = tokenize(raw, { splitSpace: isMulti, splitHyphen: true });

  const matchedValues = new Set();
  const matchedTokens = new Set();

  for (const c of candidates) {
    const slug = normalizeSlug(c);
    const compressed = normalizeCompressed(c);
    if (allowed.has(slug) || allowed.has(compressed)) {
      for (const v of valueVocab) {
        if (normalizeSlug(v) === slug || normalizeCompressed(v) === compressed) {
          matchedValues.add(v);
          matchedTokens.add(c);
          break;
        }
      }
    }
  }

  let values = [...matchedValues];

  // Connectivity: if both wired and wireless are present, prefer wireless.
  if (fieldName === 'connectivity' && values.includes('wired') && values.includes('wireless')) {
    values = ['wireless'];
  }

  if (type !== 'multi' && values.length > 1) {
    values = [values[0]];
  }

  // A raw value is only "unmapped" if none of its tokens normalised to a canonical.
  const unmapped = values.length === 0 ? [String(raw).trim()] : [];

  return { values, unmapped };
}

// Convenience wrapper that returns the single scalar/array value the schema expects.
function getCanonicalAndStorage(raw, facet, fieldName, product, idToRoot) {
  // Direct product fields
  if (fieldName === 'price') {
    const n = Number(raw);
    return {
      source: 'price_data.unit_amount',
      raw,
      canonical: [String(raw)],
      storage: Number.isFinite(n) ? n : null,
      isMapped: Number.isFinite(n),
      unmapped: Number.isFinite(n) ? [] : [raw],
    };
  }

  if (fieldName === 'brand') {
    return {
      source: 'brand->slug.current',
      raw,
      canonical: raw ? [raw] : [],
      storage: raw ? [raw] : null,
      isMapped: !!raw,
      unmapped: raw ? [] : [raw],
    };
  }

  if (fieldName === 'inStock') {
    const truthy = raw === 'true';
    const falsy = raw === 'false';
    const mapped = truthy || falsy;
    return {
      source: 'stock - reservedStock',
      raw,
      canonical: mapped ? [raw] : [],
      storage: mapped ? (truthy ? true : false) : null,
      isMapped: mapped,
      unmapped: mapped ? [] : [raw],
    };
  }

  if (fieldName === 'category') {
    const rootNames = productRootCategories(product, idToRoot);
    const slugs = rootNames.map((name) => ROOT_SLUGS[name]).filter(Boolean);
    return {
      source: 'catalogueLocationKeys',
      raw: rootNames.join(', '),
      canonical: slugs,
      storage: slugs.length ? slugs : null,
      isMapped: slugs.length > 0,
      unmapped: [],
    };
  }

  if (fieldName === 'featuredPriority') {
    const val = product.displayPriority;
    const mapped = val !== undefined && val !== null && Number.isFinite(Number(val));
    return {
      source: 'displayPriority',
      raw: String(val),
      canonical: mapped ? [String(val)] : [],
      storage: mapped ? Number(val) : null,
      isMapped: mapped,
      unmapped: mapped ? [] : [String(val)],
    };
  }

  const title = findFirstFieldTitle(product, FIELD_TITLE_CANDIDATES[fieldName]);
  const result = mappableValues(raw, facet, fieldName);
  const storage = toStorageValue(result.values, facet.type, fieldName);

  return {
    source: title || FIELD_TITLE_CANDIDATES[fieldName].join(' / '),
    raw,
    canonical: result.values,
    storage,
    isMapped: result.values.length > 0,
    unmapped: result.unmapped,
  };
}

function toStorageValue(values, type, fieldName) {
  if (!values || values.length === 0) return null;
  if (type === 'boolean' || (type === 'enum' && fieldName !== 'compatibility')) {
    return values[0];
  }
  if (type === 'multi' || fieldName === 'compatibility' || fieldName === 'brand' || fieldName === 'category') {
    return values;
  }
  if (type === 'range' || type === 'number') {
    return values[0];
  }
  return values[0];
}

function findFirstFieldTitle(product, candidates) {
  const all = [
    ...(product.overviewFields || []),
    ...(product.specifications || []),
  ];
  for (const item of all) {
    const title = (item.title || '').trim();
    if (candidates.some((c) => title.toLowerCase() === c.toLowerCase())) {
      return title;
    }
  }
  return null;
}

const FIELD_TITLE_CANDIDATES = {
  wearingStyle: ['Wearing style'],
  backDesign: ['Back design', 'Cup style', 'Cup / back design'],
  driverType: ['Driver type', 'Driver Type'],
  connectivity: ['Connectivity'],
  connector: ['Connector', 'Connector / plug'],
  microphone: ['Microphone', 'Microphones'],
  noiseCancelling: ['Noise cancelling', 'Noise canceling', 'ANC', 'Active noise cancelling'],
  requiresAmplifier: ['Amp required', 'Requires amplifier', 'Amplifier required'],
  deviceType: ['Device type', 'Product type', 'Type'],
  formFactor: ['Form factor', 'Portability'],
  amplification: ['Amplifier type', 'Amplification'],
  dacIncluded: ['DAC included', 'DAC', 'Built-in DAC'],
  balancedOutput: ['Balanced output', 'Balanced', 'Balanced connection'],
  inputs: ['Inputs', 'Input'],
  outputs: ['Outputs', 'Output'],
  accessoryType: ['Accessory type', 'Type'],
  connectorTermination: ['Connector / termination', 'Connector', 'Termination'],
  compatibility: ['Compatibility', 'Compatible with', 'Fits'],
};

// ── product export lifecycle ──

async function fetchProducts() {
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
  const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
  const token = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN;

  if (!projectId || !token) {
    throw new Error(
      'Missing Sanity credentials. Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_READ_WRITE.'
    );
  }

  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2023-05-03',
    useCdn: false,
  });

  const query = `*[_type == "product"] {
    _id,
    name,
    "slug": slug.current,
    catalogueLocationKeys,
    displayPriority,
    stock,
    reservedStock,
    "price": price_data.unit_amount,
    "brandSlug": brand->slug.current,
    "brandName": brand->name,
    overviewFields,
    specifications,
    _createdAt,
    filterAttributes,
    sortAttributes
  }`;

  return client.fetch(query);
}

async function loadOrRefreshExport(refresh = false) {
  if (refresh || !fs.existsSync(EXPORT_PATH)) {
    console.log('Fetching fresh product export from Sanity...');
    const products = await fetchProducts();
    const exportData = {
      generatedAt: new Date().toISOString(),
      count: products.length,
      products,
    };
    saveJson(EXPORT_PATH, exportData);
    console.log(`Wrote ${products.length} products to ${path.relative(process.cwd(), EXPORT_PATH)}`);
    return products;
  }

  const mtime = getEnvFileMtime(EXPORT_PATH);
  const age = mtime ? daysAgo(mtime) : Infinity;
  if (age > 7) {
    console.error(`⚠ EXPORT STALE: export is ${Math.floor(age)} days old (older than 7 days).`);
    console.error('Run with --refresh to fetch a new export before running the migration.');
    process.exit(1);
  }

  const exportData = loadJson(EXPORT_PATH);
  if (!Array.isArray(exportData.products)) {
    throw new Error('Invalid export file: missing products array.');
  }
  console.log(`Using existing export (${Math.floor(age)} days old).`);
  return exportData.products;
}

function getSanityClient() {
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
  const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
  const token = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN;

  if (!projectId || !token) {
    throw new Error('Missing Sanity credentials. Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_READ_WRITE.');
  }

  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2023-05-03',
    useCdn: false,
  });
}

function getFieldNamesForGroup(group) {
  if (!group || group === 'all') return Object.keys(FIELD_EXTRACTORS);
  const fields = GROUPS[group];
  if (!fields) throw new Error(`Unknown group: ${group}. Use one of: all, ${Object.keys(GROUPS).join(', ')}`);
  return fields;
}

// ── exports ──

module.exports = {
  BASE_DIR,
  EXPORT_PATH,
  INDEX_PATH,
  FACET_MAP_PATH,
  ROOT_SLUGS,
  GROUPS,
  DIRECT_FIELDS,
  MS_PER_DAY,
  loadJson,
  saveJson,
  getArg,
  getArgValue,
  getEnvFileMtime,
  daysAgo,
  normalizeSlug,
  normalizeCompressed,
  tokenize,
  splitCompatibility,
  isPlaceholderVocab,
  BOOLEAN_TRUTHY,
  BOOLEAN_FALSY,
  findFirstFieldValue,
  buildIdToRoot,
  productRootCategories,
  FIELD_EXTRACTORS,
  FIELD_TITLE_CANDIDATES,
  mappableValues,
  getCanonicalAndStorage,
  toStorageValue,
  loadOrRefreshExport,
  getSanityClient,
  getFieldNamesForGroup,
  fetchProducts,
};
