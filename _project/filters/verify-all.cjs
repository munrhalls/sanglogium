// _project/filters/verify-all.cjs
//
// L6 end-to-end verification: one pass that proves every facet and sort is
// wired to its backing field, every catalogue-visible product has its
// category-specific filterAttributes and a sortAttributes.featuredPriority
// value, and no filter/sort source path reads from free-text product fields.
//
// Usage:
//   node _project/filters/verify-all.cjs
//   node _project/filters/verify-all.cjs --refresh
//   node _project/filters/verify-all.cjs --break <_id> <fieldName> <badValue>

const fs = require('fs');
const path = require('path');

const {
  isMigratedValuePresent,
  getFacetByName,
  applicableFieldsForProduct,
  validateClosedVocab,
  validateConsistency,
  loadJson,
  padEnd,
} = require('./gap-lib.cjs');

const {
  loadOrRefreshExport,
  buildIdToRoot,
  productRootCategories,
  getArg,
  getArgValue,
} = require('./migrate-lib.cjs');

const BASE_DIR = path.join(__dirname, '..', '..');
const FACET_MAP_PATH = path.join(__dirname, 'facet-map.json');
const SORT_MAP_PATH = path.join(__dirname, 'sort-map.json');

const WIRING_SOURCE_FILES = [
  'lib/catalogue/facetMap.ts',
  'lib/catalogue/filterSortParams.ts',
  'lib/catalogue/buildProductQuery.ts',
  'app/hooks/nuqs/useFilterSort.tsx',
  'app/components/features/filters/FilterSidebar.tsx',
  'app/components/features/filters/PriceRangeSlider.tsx',
  'app/components/features/filters/ActiveFilterChips.tsx',
  'app/components/features/filters/SortDropdown.tsx',
  'app/components/features/filters/MobileSortButton.tsx',
  'app/components/features/filters/SortBar.tsx',
  'app/components/features/filters/MobileFilterBar.tsx',
  'sanity-cms/lib/products/getFilterFacets.ts',
  'sanity-cms/lib/products/getBrandFacets.ts',
  'app/(store)/products/page.tsx',
  'app/(store)/products/[...slug]/page.tsx',
];

function readRel(rel) {
  return fs.readFileSync(path.join(BASE_DIR, rel), 'utf8');
}

function hasAll(text, parts) {
  return parts.every((p) => text.includes(p));
}

function runWiringCheck(facetMap, sortMap) {
  const facetMapTs = readRel('lib/catalogue/facetMap.ts');
  const buildProductQueryTs = readRel('lib/catalogue/buildProductQuery.ts');
  const filterSortParamsTs = readRel('lib/catalogue/filterSortParams.ts');

  console.log('=== Wiring table ===');
  let unwired = 0;
  for (const facet of facetMap) {
    const inMap = hasAll(facetMapTs, [
      `urlParam: '${facet.urlParam}'`,
      `field: '${facet.field}'`,
    ]);
    const inQuery =
      buildProductQueryTs.includes('FILTER_FACETS') &&
      buildProductQueryTs.includes('filterAttributes.');
    const wired = inMap && inQuery;
    if (!wired) unwired++;
    console.log(`${wired ? '✓' : '✗'} ${facet.facet} -> ${facet.urlParam} -> ${facet.field}`);
  }

  for (const sort of sortMap) {
    const inMap = hasAll(facetMapTs, [
      `urlValue: '${sort.urlValue}'`,
      `backingField: '${sort.backingField}'`,
    ]);
    const inParams = filterSortParamsTs.includes('SORT_OPTIONS');
    const inQuery =
      buildProductQueryTs.includes(`case '${sort.urlValue}':`) &&
      buildProductQueryTs.includes(sort.backingField);
    const wired = inMap && inParams && inQuery;
    if (!wired) unwired++;
    console.log(`${wired ? '✓' : '✗'} ${sort.sort} -> ${sort.urlValue} -> ${sort.backingField}`);
  }

  return unwired;
}

function runFreeTextCheck() {
  const regex = /\.(overviewFields|specifications|description)\b/g;
  let count = 0;
  for (const rel of WIRING_SOURCE_FILES) {
    const text = readRel(rel);
    count += (text.match(regex) || []).length;
  }
  return count;
}

function injectBrokenProduct(products, facetMap) {
  const id = getArgValue('break');
  if (!id) return null;

  const fieldIdx = process.argv.indexOf('--break');
  const fieldName = process.argv[fieldIdx + 2];
  const rawValue = process.argv[fieldIdx + 3];

  if (!fieldName) {
    console.error('Usage: --break <_id> <fieldName> <badValue>');
    process.exit(1);
  }

  const product = products.find((p) => p._id === id);
  if (!product) {
    console.error(`❌ Could not find product with _id "${id}"`);
    process.exit(1);
  }

  let brokenValue = rawValue;
  if (rawValue && rawValue.startsWith('[')) {
    try {
      brokenValue = JSON.parse(rawValue);
    } catch {
      /* keep as raw string */
    }
  }

  product.filterAttributes = product.filterAttributes || {};
  product.filterAttributes[fieldName] = brokenValue;
  console.log(`\n🔨 Injected broken value into ${product.name} (${product._id}):`);
  console.log(`   filterAttributes.${fieldName} = ${JSON.stringify(brokenValue)}\n`);
  return product._id;
}

async function main() {
  const facetMap = loadJson(FACET_MAP_PATH);
  const sortMap = loadJson(SORT_MAP_PATH);

  const products = await loadOrRefreshExport();
  const idToRoot = buildIdToRoot();

  const unwired = runWiringCheck(facetMap, sortMap);

  const brokenId = getArg('break') ? injectBrokenProduct(products, facetMap) : null;

  const closedVocab = [];
  const consistency = [];
  const missingApplicable = [];
  const missingFeatured = [];

  const visibleProducts = products.filter(
    (p) => Array.isArray(p.catalogueLocationKeys) && p.catalogueLocationKeys.length > 0
  );

  for (const p of visibleProducts) {
    if (productRootCategories(p, idToRoot).length === 0) continue;

    closedVocab.push(...validateClosedVocab(p, facetMap));
    consistency.push(...validateConsistency(p, facetMap));

    const applicable = applicableFieldsForProduct(p, idToRoot, facetMap);
    for (const fieldName of applicable) {
      const facet = getFacetByName(facetMap, fieldName);
      const current = (p.filterAttributes || {})[fieldName];
      if (!isMigratedValuePresent(current, facet)) {
        missingApplicable.push({ product: p._id, name: p.name, field: fieldName });
      }
    }

    const featuredPriority = p.sortAttributes?.featuredPriority;
    if (featuredPriority === undefined || featuredPriority === null) {
      missingFeatured.push({ product: p._id, name: p.name });
    }
  }

  const freeTextCount = runFreeTextCheck();

  console.log('\n=== Coverage ===');
  console.log(`catalogue-visible products checked: ${visibleProducts.length}`);
  console.log(`products with sortAttributes.featuredPriority: ${visibleProducts.length - missingFeatured.length}`);
  console.log(`missing applicable filterAttributes: ${missingApplicable.length}`);

  if (missingFeatured.length > 0 && !brokenId) {
    console.log('\n=== Missing sortAttributes.featuredPriority (first 10) ===');
    for (const v of missingFeatured.slice(0, 10)) {
      console.log(`  ${padEnd(v.product.slice(0, 26), 28)} ${v.name.slice(0, 60)}`);
    }
    if (missingFeatured.length > 10) console.log(`  ... and ${missingFeatured.length - 10} more.`);
  }

  console.log('\n=== Verification summary ===');
  console.log(`closed-vocab violations: ${closedVocab.length}`);
  console.log(`consistency violations: ${consistency.length}`);
  console.log(`free-text filter/sort reads: ${freeTextCount}`);

  if (brokenId) {
    console.log(`\n🔨 Broken-product test injected into _id: ${brokenId}`);
    const product = visibleProducts.find((p) => p._id === brokenId);
    const brokenViolation =
      closedVocab.find((v) => v.product === brokenId) ||
      consistency.find((v) => v.product === brokenId);
    if (brokenViolation) {
      console.log(`❌ Broken product detected: ${product?.name ?? 'unknown'} (${brokenId})`);
      console.log(`   rule: ${brokenViolation.rule}, field: ${brokenViolation.field}, got: ${JSON.stringify(brokenViolation.got)}, expected: ${JSON.stringify(brokenViolation.expected)}`);
    } else if (closedVocab.length === 0 && consistency.length === 0) {
      console.log('❌ Broken product was NOT detected (no closed-vocab or consistency violations).');
      process.exit(1);
    }
  }

  const totalFailures =
    unwired +
    closedVocab.length +
    consistency.length +
    missingApplicable.length +
    missingFeatured.length +
    freeTextCount;

  if (totalFailures > 0) {
    console.log('\n❌ Verification failed.');
    process.exit(1);
  }

  console.log('\n✅ Verification passed.');
}

main().catch((err) => {
  console.error('❌ verify-all error:', err.message);
  process.exit(1);
});
