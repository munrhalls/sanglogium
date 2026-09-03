const {
  getSanityClient,
  getArg,
  getArgValue,
  loadOrRefreshExport,
  loadJson,
  buildIdToRoot,
  productRootCategories,
} = require('./migrate-lib.cjs');

const {
  getFieldName,
  getFacetByName,
  applicableFieldsForProduct,
  isMigratedValuePresent,
  proposeFillValue,
  saveJson,
  padEnd,
  padStart,
} = require('./gap-lib.cjs');

const fs = require('fs');
const path = require('path');

const FACET_MAP_PATH = path.join(__dirname, 'facet-map.json');
const DEFAULT_SOURCE_PATH = path.join(__dirname, 'gap-fill-source.json');
const DEFAULT_GENERATED_PATH = path.join(__dirname, 'gap-fill-source-generated.json');

function exists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function loadManualSource(sourcePath) {
  if (!sourcePath || !exists(sourcePath)) return null;
  const raw = loadJson(sourcePath);
  return raw && raw.products ? raw : null;
}

function getGroupForField(fieldName) {
  const map = {
    headphones: ['wearingStyle', 'backDesign', 'driverType', 'connectivity', 'connector', 'microphone', 'noiseCancelling', 'requiresAmplifier'],
    'audio-electronics': ['deviceType', 'formFactor', 'amplification', 'dacIncluded', 'balancedOutput', 'inputs', 'outputs'],
    accessories: ['accessoryType', 'connectorTermination', 'compatibility'],
  };
  for (const [group, fields] of Object.entries(map)) {
    if (fields.includes(fieldName)) return group;
  }
  return null;
}

async function main() {
  const isDryRun = !getArg('apply');
  const isRefresh = getArg('refresh');
  const useHeuristics = getArg('heuristics');
  const saveSource = getArg('save-source');
  const categoryFilter = getArgValue('category');
  const groupFilter = getArgValue('group');
  const sourcePath = getArgValue('source') || DEFAULT_SOURCE_PATH;

  if (isDryRun) {
    console.log('🚀 Running gap-fill in DRY-RUN mode. No data will be modified.');
  } else {
    console.log('🚀 Running gap-fill in APPLY mode. Data will be modified.');
  }

  if (isRefresh) console.log('--refresh: fetching a fresh export before filling.');
  if (useHeuristics) console.log('--heuristics: name/slug based inference is enabled.');
  if (categoryFilter) console.log(`--category: only filling products in category ${categoryFilter}`);
  if (groupFilter) console.log(`--group: only filling ${groupFilter} facet group`);

  const products = await loadOrRefreshExport(isRefresh);
  const facetMap = loadJson(FACET_MAP_PATH);
  const idToRoot = buildIdToRoot();

  const manualSource = loadManualSource(sourcePath);
  if (!manualSource && !useHeuristics) {
    console.log('\n⚠ No manual source found and --heuristics not set.');
    console.log(`Expected a file at ${sourcePath} or run with --heuristics.`);
    console.log('Generate a blank source with: node _project/filters/gap-report.cjs');
    process.exit(0);
  }

  const generatedSource = { _note: 'Heuristic fill source. Review before applying.', products: {} };
  const patchSet = [];
  const perFieldCount = {};
  const perProductSummary = [];
  let affectedCount = 0;
  let skippedUnmapped = 0;

  for (const product of products) {
    if (!Array.isArray(product.catalogueLocationKeys) || product.catalogueLocationKeys.length === 0) continue;
    const roots = productRootCategories(product, idToRoot);
    if (roots.length === 0) continue;

    const current = product.filterAttributes || {};
    const applicable = applicableFieldsForProduct(product, idToRoot, facetMap);
    const proposed = {};

    for (const fieldName of applicable) {
      // Skip already-filled values.
      const facet = getFacetByName(facetMap, fieldName);
      const currentValue = current[fieldName];
      if (isMigratedValuePresent(currentValue, facet)) continue;

      // Category / group filter.
      if (categoryFilter) {
        const slugs = roots.map((r) => require('./migrate-lib.cjs').ROOT_SLUGS[r]);
        if (!slugs.includes(categoryFilter)) continue;
      }
      if (groupFilter) {
        if (getGroupForField(fieldName) !== groupFilter) continue;
      }

      const result = proposeFillValue(product, fieldName, facet, current, manualSource, useHeuristics, proposed);
      if (!result || !result.isMapped) {
        if (result && result.unmapped && result.unmapped.length > 0) skippedUnmapped++;
        continue;
      }

      // For heuristics mode, collect into generated source instead of applying directly.
      if (useHeuristics && saveSource) {
        generatedSource.products[product._id] = generatedSource.products[product._id] || { name: product.name, category: roots[0], values: {} };
        generatedSource.products[product._id].values[fieldName] = Array.isArray(result.storage) ? result.storage.join(', ') : result.storage;
      }

      // Skip if the same value is already present (re-run safety).
      if (JSON.stringify(currentValue) === JSON.stringify(result.storage)) continue;

      proposed[fieldName] = result;
    }

    if (Object.keys(proposed).length === 0) continue;

    affectedCount++;
    const patch = {};
    for (const [fieldName, result] of Object.entries(proposed)) {
      patch[`filterAttributes.${fieldName}`] = result.storage;
      perFieldCount[fieldName] = (perFieldCount[fieldName] || 0) + 1;
    }
    patchSet.push({ id: product._id, patch });

    // Per-product output
    console.log(`\n${product.name} (${product._id})`);
    for (const [fieldName, result] of Object.entries(proposed)) {
      console.log(`  filterAttributes.${fieldName}: ${JSON.stringify(result.storage)}`);
    }
  }

  if (saveSource) {
    saveJson(DEFAULT_GENERATED_PATH, generatedSource);
    console.log(`\nWrote heuristic source to ${path.relative(process.cwd(), DEFAULT_GENERATED_PATH)}`);
  }

  console.log(`\n=== Fill summary (${isDryRun ? 'DRY-RUN' : 'APPLY'}) ===`);
  console.log(`products affected: ${affectedCount}`);
  console.log(`fields filled: ${Object.keys(perFieldCount).length}`);
  for (const [fieldName, count] of Object.entries(perFieldCount).sort()) {
    console.log(`  ${padEnd(fieldName, 22)} ${padStart(count, 4)}`);
  }
  if (skippedUnmapped) console.log(`skipped unmapped values: ${skippedUnmapped}`);

  if (!isDryRun && patchSet.length > 0) {
    if (!process.env.SANITY_STUDIO_PROJECT_ID || !process.env.SANITY_STUDIO_READ_WRITE) {
      console.error('❌ Missing Sanity credentials. Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_READ_WRITE.');
      process.exit(1);
    }

    const client = getSanityClient();
    const tx = client.transaction();
    for (const { id, patch } of patchSet) {
      tx.patch(id, (p) => p.set(patch));
    }

    console.log(`\nCommitting ${patchSet.length} patches to Sanity...`);
    await tx.commit();
    console.log('✓ Patches committed.');
  }

  console.log(isDryRun ? '\n🏁 Dry-run finished. Add --apply to persist, or --heuristics --save-source to review a generated source.' : '\n🏁 Apply finished.');
}

main().catch((err) => {
  console.error('❌ Fill gaps error:', err.message);
  process.exit(1);
});
