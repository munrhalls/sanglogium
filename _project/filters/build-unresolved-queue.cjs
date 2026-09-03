const fs = require('fs');
const path = require('path');

const {
  FACET_MAP_PATH,
  loadJson,
  saveJson,
  getArg,
  loadOrRefreshExport,
  buildIdToRoot,
  productRootCategories,
  FIELD_EXTRACTORS,
  FIELD_TITLE_CANDIDATES,
  getCanonicalAndStorage,
  splitCompatibility,
  normalizeSlug,
} = require('./migrate-lib.cjs');

const MATRIX_PATH = path.join(__dirname, 'product-facet-applicability-matrix.json');
const QUEUE_JSON = path.join(__dirname, 'unresolved-queue.json');
const QUEUE_CSV = path.join(__dirname, 'unresolved-queue.csv');
const RESOLUTIONS_TEMPLATE = path.join(__dirname, 'human-resolutions.json');

function csvCell(value) {
  const s = String(value == null ? '' : value).replace(/"/g, '""');
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s}"`;
  }
  return s;
}

function truncate(str, max = 200) {
  const s = String(str || '');
  return s.length <= max ? s : s.slice(0, max).trim() + '…';
}

function getFieldName(facet) {
  return facet.field.replace('filterAttributes.', '');
}

function buildUnresolvedQueue() {
  const matrix = loadJson(MATRIX_PATH);
  const facetMap = loadJson(FACET_MAP_PATH);
  const products = [];
  const productById = new Map();
  const productSlugs = new Set();

  return { matrix, facetMap, products, productById, productSlugs };
}

async function main() {
  const isRefresh = getArg('refresh');
  const products = await loadOrRefreshExport(isRefresh);
  const idToRoot = buildIdToRoot();
  const matrix = loadJson(MATRIX_PATH);
  const facetMap = loadJson(FACET_MAP_PATH);

  const productById = new Map();
  const productSlugs = new Set();
  for (const p of products) {
    productById.set(p._id, p);
    if (p.slug) productSlugs.add(p.slug);
  }

  const queue = [];
  const perFacet = {};
  for (const f of facetMap) perFacet[f.facet] = 0;

  for (const row of matrix.matrix) {
    const product = productById.get(row._id);
    if (!product) {
      for (const [facetName, cell] of Object.entries(row.facets)) {
        if (cell.state !== 'needs value') continue;
        queue.push({
          _id: row._id,
          name: row.name,
          slug: row.slug,
          brand: row.brand || 'unknown',
          facet: facetName,
          note: 'Product not found in export',
        });
        perFacet[facetName]++;
      }
      continue;
    }

    const brand = product.brandName || product.brandSlug || 'unknown';

    for (const [facetName, cell] of Object.entries(row.facets)) {
      if (cell.state !== 'needs value') continue;

      const facet = facetMap.find((f) => f.facet === facetName);
      if (!facet) {
        queue.push({
          _id: row._id,
          name: row.name,
          slug: row.slug,
          brand,
          facet: facetName,
          note: 'Facet definition not found in facet-map.json',
        });
        perFacet[facetName]++;
        continue;
      }

      const fieldName = getFieldName(facet);
      const extractor = FIELD_EXTRACTORS[fieldName];

      if (!extractor) {
        queue.push({
          _id: row._id,
          name: row.name,
          slug: row.slug,
          brand,
          facet: facetName,
          note: `No extractor defined for field ${fieldName}`,
        });
        perFacet[facetName]++;
        continue;
      }

      const raw = extractor(product, idToRoot);

      if (fieldName === 'compatibility') {
        if (!raw) {
          queue.push({
            _id: row._id,
            name: row.name,
            slug: row.slug,
            brand,
            facet: facetName,
            note: 'No matching field found for Compatibility / Compatible with / Fits',
          });
          perFacet[facetName]++;
          continue;
        }

        const parts = splitCompatibility(raw);
        const unmatched = parts.filter((part) => !productSlugs.has(normalizeSlug(part)));

        if (unmatched.length > 0) {
          queue.push({
            _id: row._id,
            name: row.name,
            slug: row.slug,
            brand,
            facet: facetName,
            note: `Compatibility raw value "${truncate(raw)}" could not be matched to canonical product slugs. Unmatched parts: ${unmatched.join(', ')}`,
          });
          perFacet[facetName]++;
        }
        continue;
      }

      if (!raw) {
        const candidates = FIELD_TITLE_CANDIDATES[fieldName] || [fieldName];
        queue.push({
          _id: row._id,
          name: row.name,
          slug: row.slug,
          brand,
          facet: facetName,
          note: `No matching field found for ${candidates.join(' / ')}`,
        });
        perFacet[facetName]++;
        continue;
      }

      const result = getCanonicalAndStorage(raw, facet, fieldName, product, idToRoot);

      if (!result.isMapped) {
        queue.push({
          _id: row._id,
          name: row.name,
          slug: row.slug,
          brand,
          facet: facetName,
          note: `Field "${result.source}" raw value "${truncate(raw)}" does not map to the closed vocabulary for ${facetName}`,
        });
        perFacet[facetName]++;
      }
    }
  }

  // JSON deliverable
  saveJson(QUEUE_JSON, {
    generatedAt: new Date().toISOString(),
    source: 'D2 acquisition pass against product export and product-facet-applicability-matrix.json',
    total: queue.length,
    perFacet,
    queue,
  });

  // CSV deliverable
  const rows = [
    ['_id', 'name', 'slug', 'brand', 'facet', 'note'].join(','),
  ];
  for (const item of queue) {
    rows.push(
      [
        csvCell(item._id),
        csvCell(item.name),
        csvCell(item.slug),
        csvCell(item.brand),
        csvCell(item.facet),
        csvCell(item.note),
      ].join(',')
    );
  }
  fs.writeFileSync(QUEUE_CSV, rows.join('\n') + '\n');

  // Human resolution template
  if (!fs.existsSync(RESOLUTIONS_TEMPLATE)) {
    saveJson(RESOLUTIONS_TEMPLATE, {
      _schema:
        "Add resolutions to the 'resolutions' array, then run node _project/filters/apply-resolutions.cjs. Only entries that currently exist in unresolved-queue.json will be applied.",
      _example: {
        _id: 'product-sanity-id',
        facet: 'Wearing style',
        value: 'over-ear',
        sourceUrl: 'https://sanglogium.com/products/product-slug',
        sourcePhrase: 'Over-ear, open-back',
        humanSet: false,
      },
      resolutions: [],
    });
  }

  console.log(`=== Unresolved value queue ===`);
  console.log(`Products inspected: ${matrix.matrix.length}`);
  console.log(`Unresolved entries:   ${queue.length}`);
  console.log(`\nBy facet:`);
  for (const [facet, count] of Object.entries(perFacet)) {
    if (count > 0) console.log(`  ${facet.padEnd(24)} ${String(count).padStart(5)}`);
  }
  console.log(`\nOutputs:`);
  console.log(`  ${QUEUE_JSON}`);
  console.log(`  ${QUEUE_CSV}`);
  console.log(`  ${RESOLUTIONS_TEMPLATE}`);
}

main().catch((err) => {
  console.error('Build unresolved queue failed:', err.message);
  process.exit(1);
});
