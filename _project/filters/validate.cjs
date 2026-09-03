const {
  loadOrRefreshExport,
  loadJson,
  getArg,
  buildIdToRoot,
  productRootCategories,
} = require('./migrate-lib.cjs');

const {
  validateClosedVocab,
  validateConsistency,
  applicableFieldsForProduct,
  isMigratedValuePresent,
  getFacetByName,
  getFieldName,
  padEnd,
  padStart,
} = require('./gap-lib.cjs');

const path = require('path');
const FACET_MAP_PATH = path.join(__dirname, 'facet-map.json');

function printViolations(violations) {
  if (violations.length === 0) {
    console.log('✓ 0 violations');
    return;
  }

  console.log(`\nFound ${violations.length} violation(s):\n`);
  console.log(`${padEnd('product', 28)} ${padEnd('rule', 24)} ${padEnd('field', 20)} expected / got`);
  for (const v of violations.slice(0, 100)) {
    const expected = Array.isArray(v.expected) ? v.expected.join(', ') : v.expected;
    const got = v.got === undefined ? '(missing)' : JSON.stringify(v.got);
    console.log(
      `${padEnd(v.product.slice(0, 26), 28)} ${padEnd(v.rule, 24)} ${padEnd(v.field, 20)} ${expected} / ${got}`
    );
  }
  if (violations.length > 100) {
    console.log(`... and ${violations.length - 100} more.`);
  }
}

function printGapViolations(products, facetMap, idToRoot) {
  const gapViolations = [];
  for (const p of products) {
    if (!Array.isArray(p.catalogueLocationKeys) || p.catalogueLocationKeys.length === 0) continue;
    if (productRootCategories(p, idToRoot).length === 0) continue;
    const applicable = applicableFieldsForProduct(p, idToRoot, facetMap);
    const current = p.filterAttributes || {};
    for (const fieldName of applicable) {
      const facet = getFacetByName(facetMap, fieldName);
      if (!isMigratedValuePresent(current[fieldName], facet)) {
        gapViolations.push({ product: p._id, name: p.name, rule: 'missing-applicable-field', field: fieldName });
      }
    }
  }
  if (gapViolations.length) {
    console.log(`\n=== Missing applicable filterAttributes ===`);
    console.log(`total missing: ${gapViolations.length}`);
    for (const v of gapViolations.slice(0, 20)) {
      console.log(`  ${padEnd(v.product.slice(0, 26), 28)} ${padEnd(v.field, 20)} ${v.name.slice(0, 60)}`);
    }
    if (gapViolations.length > 20) console.log(`  ... and ${gapViolations.length - 20} more.`);
  }
  return gapViolations;
}

async function main() {
  const isRefresh = getArg('refresh');

  const products = await loadOrRefreshExport(isRefresh);
  const facetMap = loadJson(FACET_MAP_PATH);
  const idToRoot = buildIdToRoot();

  const all = [];

  console.log('=== Closed-vocabulary validation ===');
  for (const p of products) {
    const vv = validateClosedVocab(p, facetMap);
    all.push(...vv);
  }
  printViolations(all);

  console.log('\n=== Cross-consistency validation ===');
  const consistency = [];
  for (const p of products) {
    consistency.push(...validateConsistency(p, facetMap));
  }
  printViolations(consistency);
  all.push(...consistency);

  const gapV = getArg('gaps') ? printGapViolations(products, facetMap, idToRoot) : [];
  all.push(...gapV);

  console.log(`\n=== Total violations: ${all.length} ===`);
  if (all.length > 0) {
    console.log('❌ Validation failed.');
    process.exit(1);
  }
  console.log('✓ Validation passed.');
}

main().catch((err) => {
  console.error('❌ Validate error:', err.message);
  process.exit(1);
});
