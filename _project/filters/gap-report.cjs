const path = require('path');
const {
  buildIdToRoot,
  productRootCategories,
  loadOrRefreshExport,
  getArg,
  getArgValue,
} = require('./migrate-lib.cjs');

const {
  buildGaps,
  printGaps,
  applicableFieldsForProduct,
  isMigratedValuePresent,
  getFacetByName,
  saveJson,
  padEnd,
  padStart,
} = require('./gap-lib.cjs');

const FACET_MAP_PATH = path.join(__dirname, 'facet-map.json');
const REPORT_PATH = path.join(__dirname, 'gap-report.json');

function loadJson(filePath) {
  return JSON.parse(require('fs').readFileSync(filePath, 'utf8'));
}

function printWorklist(gaps, facetMap, limit) {
  console.log('\n=== Gap worklist (first ' + limit + ' rows) ===');
  console.log(`${padEnd('product', 28)} ${padEnd('field', 22)} ${padEnd('category', 18)} name`);

  for (let i = 0; i < Math.min(gaps.allGaps.length, limit); i++) {
    const g = gaps.allGaps[i];
    const facet = getFacetByName(facetMap, g.field);
    const label = facet ? facet.facet : g.field;
    console.log(
      `${padEnd(g.product.slice(0, 26), 28)} ${padEnd(label, 22)} ${padEnd(g.category, 18)} ${g.name.slice(0, 60)}`
    );
  }
  if (gaps.allGaps.length > limit) {
    console.log(`... and ${gaps.allGaps.length - limit} more.`);
  }
}

async function main() {
  const isRefresh = getArg('refresh');
  const limit = Number(getArgValue('limit') || '50');

  const products = await loadOrRefreshExport(isRefresh);
  const facetMap = loadJson(FACET_MAP_PATH);
  const idToRoot = buildIdToRoot();

  const gaps = buildGaps(products, facetMap, idToRoot);
  printGaps(gaps, facetMap);
  printWorklist(gaps, facetMap, limit);

  const report = {
    generatedAt: new Date().toISOString(),
    totalProducts: gaps.totalProducts,
    totalGaps: gaps.totalGaps,
    perCategory: gaps.perCategory,
    allGaps: gaps.allGaps,
  };
  saveJson(REPORT_PATH, report);
  console.log(`\nWrote gap report to ${path.relative(process.cwd(), REPORT_PATH)}`);

  // Also emit a blank manual-source template grouped by product for the human to fill.
  const template = { _note: 'Add per-product field values here, then run fill-gaps.cjs --source _project/filters/gap-fill-source.json --dry-run', products: {} };
  for (const g of gaps.allGaps) {
    template.products[g.product] = template.products[g.product] || { name: g.name, category: g.category, values: {} };
    template.products[g.product].values[g.field] = '';
  }
  const templatePath = path.join(__dirname, 'gap-fill-source.json');
  saveJson(templatePath, template);
  console.log(`Wrote manual-source template to ${path.relative(process.cwd(), templatePath)}`);
  console.log('\n🏁 Gap report finished.');
}

main().catch((err) => {
  console.error('❌ Gap report error:', err.message);
  process.exit(1);
});
