const {
  FACET_MAP_PATH,
  loadJson,
  getArg,
  getArgValue,
  loadOrRefreshExport,
  buildIdToRoot,
  productRootCategories,
  FIELD_EXTRACTORS,
  FIELD_TITLE_CANDIDATES,
  mappableValues,
  toStorageValue,
} = require('./migrate-lib.cjs');

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

function getRawAndSource(product, fieldName, idToRoot) {
  if (fieldName === 'featuredPriority') {
    return {
      raw: product.displayPriority,
      source: 'displayPriority',
      isDirect: true,
    };
  }
  if (fieldName === 'price') {
    return { raw: product.price, source: 'price_data.unit_amount', isDirect: true };
  }
  if (fieldName === 'brand') {
    return { raw: product.brandSlug, source: 'brand->slug.current', isDirect: true };
  }
  if (fieldName === 'inStock') {
    if (product.stock === undefined || product.stock === null) return { raw: null, source: 'stock', isDirect: true };
    return { raw: product.stock - (product.reservedStock || 0) > 0 ? 'true' : 'false', source: 'stock - reservedStock', isDirect: true };
  }
  if (fieldName === 'category') {
    const roots = productRootCategories(product, idToRoot);
    return { raw: roots.join(', '), source: 'catalogueLocationKeys', isDirect: true };
  }

  const extractor = FIELD_EXTRACTORS[fieldName];
  if (!extractor) return { raw: null, source: null, isDirect: false };
  const raw = extractor(product, idToRoot);
  const title = findFirstFieldTitle(product, FIELD_TITLE_CANDIDATES[fieldName] || []);
  return { raw, source: title || FIELD_TITLE_CANDIDATES[fieldName].join(' / '), isDirect: false };
}

function getAfter(raw, facet, fieldName, idToRoot, product) {
  if (fieldName === 'featuredPriority') {
    if (raw === undefined || raw === null) return { values: [], mapped: false };
    return { values: [String(raw)], mapped: true };
  }
  if (fieldName === 'price') {
    const n = Number(raw);
    return Number.isFinite(n) ? { values: [String(n)], mapped: true } : { values: [], mapped: false };
  }
  if (fieldName === 'brand') {
    return raw ? { values: [raw], mapped: true } : { values: [], mapped: false };
  }
  if (fieldName === 'inStock') {
    return raw === 'true' || raw === 'false' ? { values: [raw], mapped: true } : { values: [], mapped: false };
  }
  if (fieldName === 'category') {
    const roots = productRootCategories(product, idToRoot);
    const slugs = roots.map((name) => {
      if (name === 'Headphones') return 'headphones';
      if (name === 'Audio Electronics') return 'audio-electronics';
      if (name === 'Accessories') return 'accessories';
      return null;
    }).filter(Boolean);
    return slugs.length ? { values: slugs, mapped: true } : { values: [], mapped: false };
  }

  if (!facet) return { values: [], mapped: false };
  const result = mappableValues(raw, facet, fieldName);
  return { values: result.values, mapped: result.values.length > 0 };
}

function buildReport(products, fieldNames, idToRoot) {
  const facetMap = loadJson(FACET_MAP_PATH);
  const fieldReports = {};
  const unmappedByField = {};

  for (const fieldName of fieldNames) {
    fieldReports[fieldName] = new Map();
    unmappedByField[fieldName] = [];
  }

  for (const product of products) {
    for (const fieldName of fieldNames) {
      const { raw, source } = getRawAndSource(product, fieldName, idToRoot);
      if (!raw) continue;

      const facet = fieldName === 'featuredPriority' ? null : facetMap.find((f) => f.field === `filterAttributes.${fieldName}`);
      const { values, mapped } = getAfter(raw, facet, fieldName, idToRoot, product);

      const rawKey = String(raw);
      if (!fieldReports[fieldName].has(rawKey)) {
        fieldReports[fieldName].set(rawKey, { raw: rawKey, values, mapped, count: 0, source, examples: [] });
      }
      const row = fieldReports[fieldName].get(rawKey);
      row.count++;
      if (row.examples.length < 3) row.examples.push(product.name);
      if (!mapped) {
        unmappedByField[fieldName].push({
          raw: rawKey,
          product: product._id,
          name: product.name,
        });
      }
    }
  }

  return { fieldReports, unmappedByField };
}

function printReport(report) {
  const { fieldReports, unmappedByField } = report;

  for (const [fieldName, map] of Object.entries(fieldReports)) {
    if (map.size === 0) continue;
    console.log(`\n=== ${fieldName} ===`);

    // Direct fields: show a compact summary, not every price.
    const isDirect = ['price', 'brand', 'inStock', 'category'].includes(fieldName);
    if (isDirect) {
      const rows = [...map.values()];
      console.log(`  distinct raw values: ${rows.length}`);
      for (const row of rows.slice(0, 12)) {
        console.log(`  ${JSON.stringify(row.raw)} -> ${JSON.stringify(row.values)}  (${row.count} product(s))`);
      }
      if (rows.length > 12) {
        console.log(`  ... and ${rows.length - 12} more distinct values.`);
      }
    } else {
      for (const row of map.values()) {
        const marker = row.mapped ? '✓' : '✗';
        const examples = row.examples.length ? ` (e.g. ${row.examples.join(', ')})` : '';
        console.log(`  [${marker}] ${JSON.stringify(row.raw)} -> ${JSON.stringify(row.values)}  (${row.count}x)${examples}`);
      }
    }
  }

  console.log('\n=== Unmapped raw values ===');
  let totalUnmapped = 0;
  for (const [fieldName, rows] of Object.entries(unmappedByField)) {
    if (rows.length === 0) continue;
    totalUnmapped += rows.length;
    console.log(`\n${fieldName}: ${rows.length} occurrence(s)`);
    for (const row of rows.slice(0, 20)) {
      console.log(`  ${JSON.stringify(row.raw)} — ${row.name} (${row.product})`);
    }
    if (rows.length > 20) {
      console.log(`  ... and ${rows.length - 20} more.`);
    }
  }
  if (totalUnmapped === 0) {
    console.log('  None.');
  } else {
    console.log(`\ntotal unmapped occurrences: ${totalUnmapped}`);
  }
}

async function main() {
  const isRefresh = getArg('refresh');
  const products = await loadOrRefreshExport(isRefresh);
  const idToRoot = buildIdToRoot();

  const visible = products.filter(
    (p) =>
      Array.isArray(p.catalogueLocationKeys) &&
      p.catalogueLocationKeys.length > 0 &&
      productRootCategories(p, idToRoot).length > 0
  );

  // All migrated fields.
  const fieldNames = Object.keys(FIELD_EXTRACTORS);
  fieldNames.push('featuredPriority');

  const report = buildReport(visible, fieldNames, idToRoot);
  printReport(report);

  console.log('\n🏁 Normalisation report finished.');
}

main().catch((err) => {
  console.error('❌ Normalisation report error:', err.message);
  process.exit(1);
});
