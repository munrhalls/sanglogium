import { writeFileSync, readFileSync } from 'node:fs';
import { sanityQuery } from './sanityRaw.mjs';

const CATEGORY = 'headphones';
const EXCLUDED_URL_PARAMS = new Set(['price', 'inStock']);
const SAME_FACET_MAX_CARDINALITY = 10;
const OUTPUT_FILE = new URL('./data/12-two-option-combination-matrix-proof.json', import.meta.url);

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
// GROQ query builders — turn a facet + candidate value(s) into the same
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

function addFacetPredicate(parts, params, facet, value) {
  if (facet.type === 'boolean') {
    parts.push(`${facet.field} == true`);
  } else {
    addMultiOrEnumPredicate(parts, params, facet, [value.trim().toLowerCase()]);
  }
}

function realWhereClauseForSameFacet(facet, values) {
  const parts = [];
  const params = {};
  addMultiOrEnumPredicate(parts, params, facet, values.map((v) => v.trim().toLowerCase()));
  return { whereClause: parts.length ? ` && ${parts.join(' && ')}` : '', params };
}

function realWhereClauseForCrossFacet(facetA, valueA, facetB, valueB) {
  const parts = [];
  const params = {};
  addFacetPredicate(parts, params, facetA, valueA);
  addFacetPredicate(parts, params, facetB, valueB);
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

function expectedIdsFor(products, facet, value) {
  return new Set(products.filter((p) => matchesOption(p, facet, value)).map((p) => p._id));
}

function symmetricDifferenceCount(expected, actual) {
  let count = 0;
  for (const id of expected) if (!actual.has(id)) count++;
  for (const id of actual) if (!expected.has(id)) count++;
  return count;
}

// ---------------------------------------------------------------------------
// Per-facet candidate value bookkeeping: which values to pair up within a
// facet, and which single "best" (highest-coverage) value to use when
// pairing this facet against another one.
// ---------------------------------------------------------------------------

function buildFacetValueMaps(facets, products) {
  const perFacetValues = new Map();
  const perFacetBestValue = new Map();

  for (const facet of facets) {
    const values = candidateValues(facet, products);
    perFacetValues.set(facet.urlParam, values);

    let best = null;
    let bestSize = -1;
    for (const value of values) {
      const size = expectedIdsFor(products, facet, value).size;
      if (size > bestSize) {
        best = value;
        bestSize = size;
      }
    }
    perFacetBestValue.set(facet.urlParam, best);
  }

  return { perFacetValues, perFacetBestValue };
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

// THE CORE CHECK THIS FUNCTION PROVES, for two values of the SAME facet
// (e.g. brand=Sony OR brand=Bose — a product matching either one should
// show up, since picking two checkboxes under one filter is a union):
//
//   expectedProductIds — ground truth. Scan every in-memory product by hand
//                        and keep it if matchesOption() is true for EITHER
//                        value. No Sanity query is involved in computing this.
//
//   actualProductIds   — reality. Run the REAL GROQ where-clause the app
//                        would send for "this facet is valueA OR valueB",
//                        and see which products it returns.
//
// If the two sets differ, the real multi-select query is wrong.
async function testSameFacetPair(facet, valueA, valueB, products, categoryIds) {
  const expectedProductIds = new Set(
    products
      .filter((p) => matchesOption(p, facet, valueA) || matchesOption(p, facet, valueB))
      .map((p) => p._id),
  );

  const { whereClause, params } = realWhereClauseForSameFacet(facet, [valueA, valueB]);
  const actualProducts = await sanityQuery(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $categoryIds]) > 0${whereClause}]{ _id }`,
    { categoryIds, ...params },
  );
  const actualProductIds = new Set(actualProducts.map((p) => p._id));
  const mismatches = symmetricDifferenceCount(expectedProductIds, actualProductIds);

  const result = {
    kind: 'same-facet-union',
    facetA: facet.urlParam,
    valueA,
    facetB: facet.urlParam,
    valueB,
    expectedCount: expectedProductIds.size,
    actualCount: actualProductIds.size,
    expectedIds: [...expectedProductIds],
    actualIds: [...actualProductIds],
    pass: mismatches === 0,
  };

  console.log(
    `${facet.urlParam}=[${valueA}, ${valueB}]  expected=${expectedProductIds.size} actual=${actualProductIds.size} mismatches=${mismatches} ${mismatches === 0 ? 'PASS' : 'FAIL'}`,
  );

  return { result, mismatches };
}

// THE CORE CHECK THIS FUNCTION PROVES, for two values on DIFFERENT facets
// (e.g. brand=Sony AND wireless=true — picking one checkbox under two
// different filters is an intersection, not a union):
//
//   expectedProductIds — ground truth. Scan every in-memory product by hand
//                        and keep it only if matchesOption() is true for
//                        BOTH facets. No Sanity query is involved here.
//
//   actualProductIds   — reality. Run the REAL GROQ where-clause the app
//                        would send for "facetA is valueA AND facetB is
//                        valueB", and see which products it returns.
//
// If the two sets differ, the real cross-facet filter combination is wrong.
async function testCrossFacetPair(facetA, valueA, facetB, valueB, products, categoryIds) {
  const expectedProductIds = new Set(
    products
      .filter((p) => matchesOption(p, facetA, valueA) && matchesOption(p, facetB, valueB))
      .map((p) => p._id),
  );

  const { whereClause, params } = realWhereClauseForCrossFacet(facetA, valueA, facetB, valueB);
  const actualProducts = await sanityQuery(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $categoryIds]) > 0${whereClause}]{ _id }`,
    { categoryIds, ...params },
  );
  const actualProductIds = new Set(actualProducts.map((p) => p._id));
  const mismatches = symmetricDifferenceCount(expectedProductIds, actualProductIds);

  const result = {
    kind: 'cross-facet-intersection',
    facetA: facetA.urlParam,
    valueA,
    facetB: facetB.urlParam,
    valueB,
    expectedCount: expectedProductIds.size,
    actualCount: actualProductIds.size,
    expectedIds: [...expectedProductIds],
    actualIds: [...actualProductIds],
    pass: mismatches === 0,
  };

  console.log(
    `${facetA.urlParam}=${valueA} AND ${facetB.urlParam}=${valueB}  expected=${expectedProductIds.size} actual=${actualProductIds.size} mismatches=${mismatches} ${mismatches === 0 ? 'PASS' : 'FAIL'}`,
  );

  return { result, mismatches };
}

async function runSameFacetTests(facets, perFacetValues, products, categoryIds) {
  const results = [];
  let mismatchTotal = 0;

  console.log('');
  console.log('SAME-FACET (union) pairs');

  for (const facet of facets) {
    if (facet.type === 'boolean') continue;
    const values = perFacetValues.get(facet.urlParam);
    if (values.length < 2 || values.length > SAME_FACET_MAX_CARDINALITY) continue;

    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        const { result, mismatches } = await testSameFacetPair(facet, values[i], values[j], products, categoryIds);
        results.push(result);
        mismatchTotal += mismatches;
      }
    }
  }

  return { results, mismatchTotal };
}

async function runCrossFacetTests(facets, perFacetBestValue, products, categoryIds) {
  const results = [];
  let mismatchTotal = 0;

  console.log('');
  console.log('CROSS-FACET (intersection) pairs');

  for (let i = 0; i < facets.length; i++) {
    for (let j = i + 1; j < facets.length; j++) {
      const facetA = facets[i];
      const facetB = facets[j];
      const valueA = perFacetBestValue.get(facetA.urlParam);
      const valueB = perFacetBestValue.get(facetB.urlParam);

      const { result, mismatches } = await testCrossFacetPair(facetA, valueA, facetB, valueB, products, categoryIds);
      results.push(result);
      mismatchTotal += mismatches;
    }
  }

  return { results, mismatchTotal };
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

  const { perFacetValues, perFacetBestValue } = buildFacetValueMaps(facets, products);

  const sameFacet = await runSameFacetTests(facets, perFacetValues, products, categoryIds);
  const crossFacet = await runCrossFacetTests(facets, perFacetBestValue, products, categoryIds);

  const results = [...sameFacet.results, ...crossFacet.results];
  const mismatchTotal = sameFacet.mismatchTotal + crossFacet.mismatchTotal;

  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

  console.log('');
  console.log(`combinations tested: ${results.length}`);
  console.log(`total mismatches: ${mismatchTotal}`);
  console.log(`ANY MISMATCH FOUND: ${mismatchTotal === 0 ? 'NO' : 'YES'}`);

  process.exit(mismatchTotal === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
