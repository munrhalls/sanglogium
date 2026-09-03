const fs = require('fs');
const path = require('path');
const { buildGaps, printGaps } = require('./gap-lib.cjs');

// Load env so SANITY_STUDIO_READ_WRITE and project details are available.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { createClient } = require('@sanity/client');

const BASE_DIR = __dirname;
const EXPORT_PATH = path.join(BASE_DIR, 'products-export.json');
const BASELINE_PATH = path.join(BASE_DIR, 'coverage-baseline.json');
const INDEX_PATH = path.join(__dirname, '..', '..', 'data', 'catalogue-index.json');
const FACET_MAP_PATH = path.join(BASE_DIR, 'facet-map.json');

const ROOT_SLUGS = {
  Headphones: 'headphones',
  'Audio Electronics': 'audio-electronics',
  Accessories: 'accessories',
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ── helpers ──

function getArg(name) {
  return process.argv.includes(name) || process.argv.includes(`--${name}`);
}

function getEnvFileMtime(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.statSync(filePath).mtime;
}

function daysAgo(mtime) {
  return (Date.now() - mtime.getTime()) / MS_PER_DAY;
}

function padEnd(str, len) {
  return String(str).padEnd(len, ' ');
}

function padStart(str, len) {
  return String(str).padStart(len, ' ');
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// ── catalogue index → root category map ──

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

// ── value extraction from existing product fields ──

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

// ── mappability ──
// Returns a mapped canonical value if `raw` can be normalised exactly into the
// facet's valueVocab, otherwise null.  Keeps the coverage scorecard honest:
// ambiguous free-text values count as gaps.

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
  candidates.add(raw);

  const separators = splitSpace ? /[,;|/\\()\\\s-]/g : /[,;|/\\()-]/g;
  if (splitHyphen === false) {
    // no-op; already covered by default regex which splits hyphen
  }

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

function mappableValue(raw, facet) {
  if (!raw) return null;

  const type = facet.type;
  const valueVocab = facet.valueVocab || [];

  // Price, brand, category, in-stock are direct or placeholder-backed.
  if (['range'].includes(type)) return raw;
  if (['brand', 'category'].includes(type) || isPlaceholderVocab(valueVocab)) {
    return raw ? raw : null;
  }

  if (type === 'boolean') {
    const compressed = normalizeCompressed(raw);
    if (BOOLEAN_TRUTHY.has(compressed) || BOOLEAN_TRUTHY.has(normalizeSlug(raw))) return 'true';
    if (BOOLEAN_FALSY.has(compressed) || BOOLEAN_FALSY.has(normalizeSlug(raw))) return 'false';
    return null;
  }

  const allowed = new Set();
  for (const v of valueVocab) {
    allowed.add(normalizeSlug(v));
    allowed.add(normalizeCompressed(v));
  }

  const isMulti = type === 'multi';
  const candidates = tokenize(raw, { splitSpace: isMulti, splitHyphen: true });

  const matches = [];
  for (const c of candidates) {
    const slug = normalizeSlug(c);
    const compressed = normalizeCompressed(c);
    if (allowed.has(slug) || allowed.has(compressed)) {
      // Resolve to the first matching canonical vocab value.
      for (const v of valueVocab) {
        if (normalizeSlug(v) === slug || normalizeCompressed(v) === compressed) {
          matches.push(v);
          break;
        }
      }
    }
  }

  if (!matches.length) return null;
  if (type === 'multi') return matches.join(', ');
  return matches[0];
}

const FIELD_EXTRACTORS = {
  price: (p) => (p.price !== undefined && p.price !== null ? String(p.price) : null),
  brand: (p) => (p.brandSlug ? p.brandSlug : null),
  inStock: (p) => {
    if (p.stock === undefined || p.stock === null) return null;
    const reserved = p.reservedStock || 0;
    return p.stock - reserved > 0 ? 'true' : 'false';
  },
  category: (p, _idToRoot) => {
    const roots = productRootCategories(p, _idToRoot);
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

// ── Sanity fetch ──

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
    filterAttributes,
    sortAttributes,
    _createdAt
  }`;

  return client.fetch(query);
}

// ── export lifecycle ──

async function loadOrRefreshExport() {
  const refresh = getArg('refresh');

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
    console.error('Run with --refresh to fetch a new export before producing a baseline.');
    process.exit(1);
  }

  const exportData = loadJson(EXPORT_PATH);
  if (!Array.isArray(exportData.products)) {
    throw new Error('Invalid export file: missing products array.');
  }
  console.log(`Using existing export (${Math.floor(age)} days old).`);
  return exportData.products;
}

// ── coverage scorecard ──

function buildScorecard(products, facetMap, idToRoot) {
  const visible = products.filter(
    (p) => Array.isArray(p.catalogueLocationKeys) && p.catalogueLocationKeys.length > 0
  );

  const displayPriorityWith = visible.filter((p) => p.displayPriority !== undefined && p.displayPriority !== null).length;
  const displayPriorityWithout = visible.length - displayPriorityWith;

  const facetByName = new Map(facetMap.map((f) => [f.field.replace('filterAttributes.', ''), f]));
  const fieldNames = Array.from(facetByName.keys());

  const categoryGroups = { Headphones: [], 'Audio Electronics': [], Accessories: [] };
  for (const p of visible) {
    const roots = productRootCategories(p, idToRoot);
    for (const root of roots) {
      if (categoryGroups[root]) categoryGroups[root].push(p);
    }
  }

  const perCategory = {};
  const overallDistinct = {};

  for (const [category, items] of Object.entries(categoryGroups)) {
    perCategory[category] = {
      productCount: items.length,
      fields: {},
    };

    for (const fieldName of fieldNames) {
      const facet = facetByName.get(fieldName);
      const extractor = FIELD_EXTRACTORS[fieldName] || (() => null);
      const distinct = new Set();
      let withValue = 0;

      for (const p of items) {
        const raw = extractor(p, idToRoot);
        if (raw) {
          const mapped = mappableValue(raw, facet);
          if (mapped) withValue++;
          distinct.add(raw);
          overallDistinct[fieldName] = overallDistinct[fieldName] || new Set();
          overallDistinct[fieldName].add(raw);
        }
      }

      perCategory[category].fields[fieldName] = {
        facet: facet.facet,
        inScope: items.length,
        withValue,
        pct: items.length ? Math.round((withValue / items.length) * 100) : 0,
        distinct: [...distinct],
      };
    }
  }

  // Convert overall sets to arrays
  const overallDistinctValues = {};
  for (const fieldName of fieldNames) {
    overallDistinctValues[fieldName] = overallDistinct[fieldName] ? [...overallDistinct[fieldName]] : [];
  }

  return {
    totalProducts: visible.length,
    displayPriority: {
      with: displayPriorityWith,
      without: displayPriorityWithout,
      pctWith: visible.length ? Math.round((displayPriorityWith / visible.length) * 100) : 0,
    },
    perCategory,
    overallDistinctValues,
  };
}

// ── output ──

function printScorecard(scorecard, exportAgeDays) {
  console.log(`\n=== Export ===`);
  console.log(`export: ${path.relative(process.cwd(), EXPORT_PATH)}`);
  console.log(`export age: ${exportAgeDays === null ? 'fresh' : `${Math.floor(exportAgeDays)} days`}`);
  console.log(`total catalogue-visible products: ${scorecard.totalProducts}`);
  if (scorecard.totalProducts < 600) {
    console.log('⚠ product count is lower than expected (700+). Check export completeness.');
  }

  const dp = scorecard.displayPriority;
  console.log(`\n=== displayPriority ===`);
  console.log(`  with:    ${padStart(dp.with, 4)} (${padStart(dp.pctWith, 3)}%)`);
  console.log(`  missing: ${padStart(dp.without, 4)} (${padStart(100 - dp.pctWith, 3)}%)`);

  for (const [category, data] of Object.entries(scorecard.perCategory)) {
    console.log(`\n=== ${category} (${data.productCount} in-scope products) ===`);
    for (const [fieldName, field] of Object.entries(data.fields)) {
      console.log(
        `  ${padEnd(field.facet, 22)} ${padStart(field.pct, 3)}%  (${padStart(field.withValue, 4)}/${padStart(field.inScope, 4)})`
      );
    }
  }

  console.log(`\n=== Distinct raw values (normalisation worklist) ===`);
  for (const [fieldName, values] of Object.entries(scorecard.overallDistinctValues)) {
    const facet = scorecard.perCategory.Headphones?.fields[fieldName]?.facet ||
      scorecard.perCategory['Audio Electronics']?.fields[fieldName]?.facet ||
      scorecard.perCategory.Accessories?.fields[fieldName]?.facet || fieldName;
    const preview = values.slice(0, 12).map((v) => JSON.stringify(v)).join(', ');
    console.log(`  ${padEnd(facet, 22)} [${preview}${values.length > 12 ? ', ...' : ''}]`);
  }
}

// ── migrated scorecard (run after applying the L3 migration) ──

function isMigratedValuePresent(value, facet) {
  if (value === undefined || value === null) return false;
  if (facet.type === 'boolean') return typeof value === 'boolean';
  if (facet.type === 'range' || facet.type === 'number') return typeof value === 'number';
  if (facet.type === 'multi' || Array.isArray(value)) return Array.isArray(value) && value.length > 0;
  if (facet.type === 'enum' || facet.type === 'string') return String(value).trim().length > 0;
  return true;
}

function buildMigratedScorecard(products, facetMap, idToRoot) {
  const visible = products.filter(
    (p) => Array.isArray(p.catalogueLocationKeys) && p.catalogueLocationKeys.length > 0
  );

  const categoryGroups = { Headphones: [], 'Audio Electronics': [], Accessories: [] };
  for (const p of visible) {
    const roots = productRootCategories(p, idToRoot);
    for (const root of roots) {
      if (categoryGroups[root]) categoryGroups[root].push(p);
    }
  }

  const facetByName = new Map(facetMap.map((f) => [f.field.replace('filterAttributes.', ''), f]));
  const fieldNames = Array.from(facetByName.keys());

  const perCategory = {};

  for (const [category, items] of Object.entries(categoryGroups)) {
    perCategory[category] = {
      productCount: items.length,
      fields: {},
    };

    for (const fieldName of fieldNames) {
      const facet = facetByName.get(fieldName);
      let withValue = 0;

      for (const p of items) {
        const current = p.filterAttributes?.[fieldName];
        if (isMigratedValuePresent(current, facet)) withValue++;
      }

      perCategory[category].fields[fieldName] = {
        facet: facet.facet,
        inScope: items.length,
        withValue,
        pct: items.length ? Math.round((withValue / items.length) * 100) : 0,
      };
    }
  }

  // featuredPriority copy check
  let withDisplayPriority = 0;
  let exactCopy = 0;
  for (const p of visible) {
    if (p.displayPriority !== undefined && p.displayPriority !== null) {
      withDisplayPriority++;
      if (p.sortAttributes?.featuredPriority === p.displayPriority) exactCopy++;
    }
  }

  return {
    totalProducts: visible.length,
    perCategory,
    featuredPriority: {
      withDisplayPriority,
      exactCopy,
    },
  };
}

function printMigratedScorecard(scorecard) {
  console.log(`\n=== Migrated filterAttributes coverage ===`);
  for (const [category, data] of Object.entries(scorecard.perCategory)) {
    console.log(`\n=== ${category} (${data.productCount} in-scope products) ===`);
    for (const [fieldName, field] of Object.entries(data.fields)) {
      console.log(
        `  ${padEnd(field.facet, 22)} ${padStart(field.pct, 3)}%  (${padStart(field.withValue, 4)}/${padStart(field.inScope, 4)})`
      );
    }
  }

  const dp = scorecard.featuredPriority;
  console.log(`\n=== sortAttributes.featuredPriority ===`);
  console.log(`  featuredPriority copy: ${dp.exactCopy}/${dp.withDisplayPriority} exact, ${dp.withDisplayPriority - dp.exactCopy} mismatch`);
}

function printDelta(migrated, baseline) {
  if (!baseline || !baseline.perCategory) return;
  console.log(`\n=== Migrated coverage delta vs L2 mappable ceiling ===`);

  for (const [category, data] of Object.entries(migrated.perCategory)) {
    const baseCat = baseline.perCategory?.[category];
    if (!baseCat) continue;

    console.log(`\n--- ${category} ---`);
    for (const [fieldName, field] of Object.entries(data.fields)) {
      const baseField = baseCat.fields?.[fieldName];
      if (!baseField) continue;
      const delta = field.withValue - baseField.withValue;
      const sign = delta >= 0 ? `+${delta}` : String(delta);
      const ok = delta === 0 ? '✓' : '✗';
      console.log(
        `  [${ok}] ${padEnd(field.facet, 22)} migrated=${padStart(field.withValue, 4)} baseline=${padStart(baseField.withValue, 4)} delta=${sign}`
      );
    }
  }

  const dpBase = baseline.displayPriority;
  const dpMig = migrated.featuredPriority;
  if (dpBase && dpMig) {
    const delta = dpMig.exactCopy - dpBase.with;
    console.log(`\n  featuredPriority copy: migrated ${dpMig.exactCopy}/${dpMig.withDisplayPriority} vs baseline with=${dpBase.with} (delta ${delta >= 0 ? '+' + delta : delta})`);
  }
}

// ── baseline write-once ──

function writeBaseline(scorecard, exportAgeDays) {
  if (fs.existsSync(BASELINE_PATH)) {
    console.log('\nbaseline frozen');
    return;
  }

  const baseline = {
    generatedAt: new Date().toISOString(),
    exportPath: path.relative(process.cwd(), EXPORT_PATH),
    exportAgeDays,
    ...scorecard,
  };
  saveJson(BASELINE_PATH, baseline);
  console.log(`\nWrote baseline to ${path.relative(process.cwd(), BASELINE_PATH)}`);
}

// ── main ──

async function main() {
  const facetMap = loadJson(FACET_MAP_PATH);
  const idToRoot = buildIdToRoot();

  const products = await loadOrRefreshExport();
  const mtime = getEnvFileMtime(EXPORT_PATH);
  const exportAgeDays = mtime ? daysAgo(mtime) : null;

  const scorecard = buildScorecard(products, facetMap, idToRoot);
  printScorecard(scorecard, exportAgeDays);

  const migratedScorecard = buildMigratedScorecard(products, facetMap, idToRoot);
  printMigratedScorecard(migratedScorecard);

  if (fs.existsSync(BASELINE_PATH)) {
    const baseline = loadJson(BASELINE_PATH);
    printDelta(migratedScorecard, baseline);
  }

  const gaps = buildGaps(products, facetMap, idToRoot);
  printGaps(gaps, facetMap);

  writeBaseline(scorecard, exportAgeDays);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
