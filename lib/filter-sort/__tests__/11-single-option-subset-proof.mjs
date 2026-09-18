import { writeFileSync, readFileSync } from 'node:fs';
import { sanityQuery } from './sanityRaw.mjs';

const CATEGORY = 'headphones';
const EXCLUDED_URL_PARAMS = new Set(['price', 'inStock']);
const OUTPUT_FILE = new URL('./data/11-single-option-subset-proof.json', import.meta.url);

// ---------------------------------------------------------------------------
// Data loading: pull FILTER_FACETS out of the TS source and load the
// pre-built catalogue index the VFS uses at runtime.
// ---------------------------------------------------------------------------

function loadFilterFacets() {
  const source = readFileSync(new URL('../../catalogue/facetMap.ts', import.meta.url), 'utf8');
  const match = source.match(/export const FILTER_FACETS: FilterFacet\[\] = (\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Could not locate FILTER_FACETS in facetMap.ts');
  return new Function(`return ${match[1]}`)();
}

function loadCatalogueIndex() {
  return JSON.parse(
    readFileSync(new URL('../../../data/catalogue-index.json', import.meta.url), 'utf8'),
  );
}

const FILTER_FACETS = loadFilterFacets();
const catalogueIndex = loadCatalogueIndex();

// ---------------------------------------------------------------------------
// Catalogue traversal
//
// The catalogue is a tree of category nodes (e.g. "headphones" contains
// child nodes like "over-ear", "wireless-earbuds"). A product only carries
// the id of the exact node it lives at, not its ancestors — so matching
// "headphones" means matching the headphones id OR any id underneath it.
// ---------------------------------------------------------------------------

// Input: one category node id (e.g. the id for "headphones").
// Output: that id plus every descendant node's id, flattened into one array.
// This is the full id set a product's catalogueLocationKeys must overlap
// with to count as "a headphones product" for this test.
function collectCategoryIdWithDescendants(categoryNodeId) {
  const slotMetadataMap = catalogueIndex.slotMetadataMap;
  if (!slotMetadataMap[categoryNodeId]) return [categoryNodeId];

  const collectedIds = new Set();
  const stack = [categoryNodeId];
  while (stack.length > 0) {
    const currentId = stack.pop();
    if (collectedIds.has(currentId)) continue;
    collectedIds.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }
  return Array.from(collectedIds);
}

// ---------------------------------------------------------------------------
// Facet helpers
// ---------------------------------------------------------------------------

// Most facets list their real allowed values in facetMap.ts (e.g. brand's
// vocab is ["Sony", "Bose", ...]). Some instead hold a placeholder like
// ["<dynamic>"] because the values are too numerous/volatile to hardcode.
// This detects that placeholder case so candidateValues() knows to derive
// the real values from the product data instead.
function isPlaceholderVocab(vocab) {
  return vocab.some((v) => v.startsWith('<') && v.endsWith('>'));
}

function facetsForCategory(category) {
  return FILTER_FACETS.filter(
    (f) => f.categories.includes('*') || f.categories.includes(category),
  );
}

// facet.field looks like "filterAttributes.brand" (a GROQ path). Strip the
// prefix to get "brand" — the bare key used to read product.filterAttributes.
function fieldKey(facet) {
  return facet.field.replace('filterAttributes.', '');
}

function facetsUnderTest() {
  return facetsForCategory(CATEGORY).filter(
    (f) => f.type !== 'range' && !EXCLUDED_URL_PARAMS.has(f.urlParam),
  );
}

// ---------------------------------------------------------------------------
// GROQ query builder — turns a facet + candidate value into the same
// where-clause the real filter-sort pipeline would produce.
// ---------------------------------------------------------------------------

function addMultiOrEnumPredicate(parts, params, facet, values) {
  if (values.length === 0) return;
  const field = facet.field;
  const paramName = `${fieldKey(facet)}Param`;
  if (facet.type === 'multi' || isPlaceholderVocab(facet.valueVocab)) {
    parts.push(`count(coalesce(${field}, [])[lower(@) in $${paramName}]) > 0`);
  } else {
    parts.push(`coalesce(lower(${field}), '') in $${paramName}`);
  }
  params[paramName] = values;
}

function realWhereClauseFor(facet, rawValue) {
  const parts = [];
  const params = {};
  if (facet.type === 'boolean') {
    parts.push(`${facet.field} == true`);
  } else {
    addMultiOrEnumPredicate(parts, params, facet, [rawValue.trim().toLowerCase()]);
  }
  return { whereClause: parts.length ? ` && ${parts.join(' && ')}` : '', params };
}

// ---------------------------------------------------------------------------
// Expected-value computation — the "source of truth" read directly off the
// in-memory product list, independent of the GROQ query under test.
// ---------------------------------------------------------------------------

function fieldValues(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map(String);
  return [String(raw)];
}

// Ground truth check, read directly off the raw product data (no query
// involved): does this product actually have this facet=value on it?
function matchesOption(product, facet, value) {
  if (facet.type === 'boolean') return product.filterAttributes[fieldKey(facet)] === true;
  const target = value.toLowerCase();
  return fieldValues(product.filterAttributes[fieldKey(facet)]).some((v) => v.toLowerCase() === target);
}

// Which values do we test for this facet? Boolean facets: just "true".
// Facets with a real vocab list: every value in that list. Facets with a
// placeholder vocab: every value actually seen on these in-memory products.
function candidateValues(facet, products) {
  if (facet.type === 'boolean') return ['true'];
  if (!isPlaceholderVocab(facet.valueVocab)) return facet.valueVocab;
  const seen = new Set();
  for (const p of products) {
    for (const v of fieldValues(p.filterAttributes[fieldKey(facet)])) seen.add(v);
  }
  return Array.from(seen);
}

// ---------------------------------------------------------------------------
// Test steps
// ---------------------------------------------------------------------------

async function loadProducts(facets, categoryIds) {
  const fields = Array.from(new Set(facets.map((f) => fieldKey(f))));
  const projection = fields.map((f) => `"${f}": filterAttributes.${f}`).join(',\n      ');

  return sanityQuery(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $categoryIds]) > 0]{
      _id, name,
      "filterAttributes": {
      ${projection}
      }
    }`,
    { categoryIds },
  );
}

// THE CORE CHECK THIS FILE PROVES, for one facet=value option (e.g. brand=Sony):
//
//   expectedProductIds  — ground truth. Scan every in-memory product by hand
//                         with matchesOption() and see which ones qualify.
//                         No Sanity query is involved in computing this.
//
//   actualProductIds    — reality. Run the REAL GROQ where-clause the app's
//                         filter would send to Sanity for this option, and
//                         see which products it returns.
//
// If expectedProductIds and actualProductIds aren't the same set, the real
// query is wrong for this option — that's the bug this test would catch.
async function testSingleOption(facet, value, products, categoryIds) {
  const expectedProductIds = new Set(
    products.filter((p) => matchesOption(p, facet, value)).map((p) => p._id),
  );

  const { whereClause, params } = realWhereClauseFor(facet, value);
  const actualProducts = await sanityQuery(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $categoryIds]) > 0${whereClause}]{ _id }`,
    { categoryIds, ...params },
  );
  const actualProductIds = new Set(actualProducts.map((p) => p._id));

  const missingFromActual = [...expectedProductIds].filter((id) => !actualProductIds.has(id));
  const unexpectedInActual = [...actualProductIds].filter((id) => !expectedProductIds.has(id));
  const mismatches = missingFromActual.length + unexpectedInActual.length;

  const result = {
    facet: facet.urlParam,
    field: facet.field,
    type: facet.type,
    value,
    expectedIds: [...expectedProductIds],
    actualIds: [...actualProductIds],
    missingFromActual,
    unexpectedInActual,
    pass: mismatches === 0,
  };

  console.log(
    `${facet.urlParam}=${value}  expected=${expectedProductIds.size} actual=${actualProductIds.size} mismatches=${mismatches} ${mismatches === 0 ? 'PASS' : 'FAIL'}`,
  );

  return { result, mismatches };
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

async function main() {
  const categoryNodeId = catalogueIndex.slugToIdMap[CATEGORY];
  const categoryIds = collectCategoryIdWithDescendants(categoryNodeId);
  const facets = facetsUnderTest();
  const products = await loadProducts(facets, categoryIds);

  console.log(`headphones VFS product count: ${products.length}`);
  console.log(`facets under test: ${facets.length}`);
  console.log('');

  const results = [];
  let mismatchTotal = 0;

  for (const facet of facets) {
    for (const value of candidateValues(facet, products)) {
      const { result, mismatches } = await testSingleOption(facet, value, products, categoryIds);
      results.push(result);
      mismatchTotal += mismatches;
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

  console.log('');
  console.log(`options tested: ${results.length}`);
  console.log(`total mismatches: ${mismatchTotal}`);
  console.log(`ANY MISMATCH FOUND: ${mismatchTotal === 0 ? 'NO' : 'YES'}`);

  process.exit(mismatchTotal === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
