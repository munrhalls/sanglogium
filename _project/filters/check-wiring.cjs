// _project/filters/check-wiring.cjs
//
// L5 wiring verification: confirms filter/sort controls + catalogue query are
// wired to the canonical facet-map.json and sort-map.json, and that no filter
// or sort path reads from free-text product fields.

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', '..');
const FACET_MAP_PATH = path.join(__dirname, 'facet-map.json');
const SORT_MAP_PATH = path.join(__dirname, 'sort-map.json');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function readFile(rel) {
  return fs.readFileSync(path.join(BASE_DIR, rel), 'utf8');
}

const facetMap = loadJson(FACET_MAP_PATH);
const sortMap = loadJson(SORT_MAP_PATH);

const facetMapTs = readFile('lib/catalogue/facetMap.ts');
const buildProductQueryTs = readFile('lib/catalogue/buildProductQuery.ts');
const filterSortParamsTs = readFile('lib/catalogue/filterSortParams.ts');
const filterSidebarTs = readFile('app/components/features/filters/FilterSidebar.tsx');
const activeFilterChipsTs = readFile('app/components/features/filters/ActiveFilterChips.tsx');

// Source files that make up the filter/sort control + catalogue query surface.
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

const wiringText = WIRING_SOURCE_FILES.map(readFile).join('\n\n');

function hasAll(text, parts) {
  return parts.every((part) => text.includes(part));
}

console.log('=== Facet wiring (facet -> urlParam -> filterAttributes field) ===');
let unwiredFacets = 0;
for (const facet of facetMap) {
  const inFacetMap = hasAll(facetMapTs, [
    `urlParam: '${facet.urlParam}'`,
    `field: '${facet.field}'`,
  ]);
  const inQuery = buildProductQueryTs.includes('FILTER_FACETS') && buildProductQueryTs.includes('filterAttributes.');
  const inControls = filterSidebarTs.includes('FILTER_FACETS') && activeFilterChipsTs.includes('FILTER_FACETS');
  const wired = inFacetMap && inQuery && inControls;
  if (!wired) unwiredFacets++;
  const marker = wired ? '✓' : '✗';
  console.log(`${marker} ${facet.facet} -> ${facet.urlParam} -> ${facet.field}`);
}

console.log('\n=== Sort wiring (sort -> URL value -> backingField) ===');
let wiredSorts = 0;
for (const sort of sortMap) {
  const inFacetMap = hasAll(facetMapTs, [
    `urlValue: '${sort.urlValue}'`,
    `backingField: '${sort.backingField}'`,
  ]);
  const inParams = filterSortParamsTs.includes('SORT_OPTIONS');
  const inQuery =
    buildProductQueryTs.includes(`case '${sort.urlValue}':`) &&
    buildProductQueryTs.includes(sort.backingField);
  const wired = inFacetMap && inParams && inQuery;
  if (wired) wiredSorts++;
  const marker = wired ? '✓' : '✗';
  console.log(`${marker} ${sort.sort} -> ${sort.urlValue} -> ${sort.backingField}`);
}

// Free-text path references (e.g. product.description, product.overviewFields,
// product.specifications).  Metadata `description:` properties are not matches.
const freeTextRegex = /\.(overviewFields|specifications|description)\b/g;
const freeTextCount = (wiringText.match(freeTextRegex) || []).length;

console.log(`\nfree-text filter/sort reads: ${freeTextCount}`);
console.log(`unwired facets: ${unwiredFacets}, sorts wired: ${wiredSorts}/${sortMap.length}`);

if (unwiredFacets > 0 || wiredSorts !== sortMap.length || freeTextCount > 0) {
  process.exit(1);
}
