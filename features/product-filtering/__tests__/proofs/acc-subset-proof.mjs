// sang-logium-269 — end-to-end proof that /products/accessories returns the
// EXACT subset of products for every filter option and every combination:
// zero non-belonging products (no false positives, no category leakage) and
// zero wrong subsets (no false negatives) for any single value, any range
// boundary, or any filter-option pair.
//
// Reuses the proof pattern built for headphones in sang-logium-ajf
// (inventory dump -> oracle predicate -> expected singles/boundaries/pairs
// -> diff against the real production query), re-targeted at the accessories
// category and its facet set: every features/product-filtering/config/facetMap.ts entry tagged
// "accessories" or "*".
//
// Run (from the repo root, against the real Sanity dataset — no dev server
// needed; this proof exercises the production GROQ predicate directly):
//   node --experimental-strip-types --loader ./features/product-filtering/__tests__/proofs/tsExtLoader.mjs \
//     --env-file=.env.local features/product-filtering/__tests__/proofs/acc-subset-proof.mjs
//
// Two independent halves, diffed for exact ID-set equality on every case:
//
//   ORACLE — the universe is every product TAGGED accessories
//   (filterAttributes.category contains "accessories" — an independent
//   signal, deliberately NOT the VFS mechanism production uses, so any
//   drift between the two scopes shows up as a diff). Expected sets are
//   computed in-memory by the hand-written predicate in this file.
//   features/product-filtering/domain/buildProductQuery.ts is the code under test and is never
//   used by this half.
//
//   ACTUAL — the REAL features/product-filtering/domain/buildProductQuery.ts (imported
//   unmodified), its GROQ executed against Sanity scoped exactly like the
//   live /products/accessories page: catalogueLocationKeys overlapping the
//   accessories VFS node and all its descendants (data/catalogue-index.json
//   — the same mechanism app/(store)/products/[...slug]/page.tsx uses).
//
// Case coverage (generated from the declared vocabularies + live data, so
// this file never needs editing when products change):
//   0. baseline — no filters: proves tag-universe == VFS-scope wholesale.
//   1. every single value — every declared vocab value of every non-range
//      accessories facet (observed values for open/placeholder vocabs like
//      brand/awards), boolean facets = true, plus inStock=true (which has
//      coalesce semantics, mirrored independently below).
//   2. every range boundary — smallest / second-smallest / largest /
//      second-largest OBSERVED value of every range facet (price, length,
//      weight capacity, outlet count): min-inclusive, min-excludes,
//      max-inclusive, max-excludes.
//   3. same-facet pairs — every value pair within a facet (union: a shopper
//      ticking two checkboxes under one filter), facets capped at 10
//      distinct values so high-cardinality open vocabs stay bounded.
//   4. cross-facet pairs — every facet x facet pairing (intersection: one
//      highest-coverage value each), proving the AND composition across
//      all clause shapes (boolean, enum, multi).
//   5. category membership — on EVERY case, every product the real query
//      returns must be tagged accessories (and never headphones /
//      audio-electronics): no non-belonging product in any filtered view.

import { readFileSync, writeFileSync } from 'node:fs';
import { sanityQuery } from './sanityRaw.mjs';
import { buildProductQuery } from '../../domain/buildProductQuery.ts';

const CATEGORY = 'accessories';
// Handled specially (coalesce semantics + boundary cases), not by the
// generic single/pair enumeration — same exclusion the headphones proof
// scripts (11/12) apply.
const EXCLUDED_URL_PARAMS = new Set(['price', 'inStock']);
const SAME_FACET_MAX_CARDINALITY = 10;
const HTTP_CONCURRENCY = 6; // Sanity HTTP roundtrips only; results print in case order
const INVENTORY_FILE = new URL('../data/acc-inventory.json', import.meta.url);
const REPORT_FILE = new URL('../data/acc-subset-proof-report.json', import.meta.url);

// ---------------------------------------------------------------------------
// Data loading: pull FILTER_FACETS out of the TS source and load the
// pre-built catalogue index the VFS uses at runtime.
// ---------------------------------------------------------------------------

function loadFilterFacets() {
  const source = readFileSync(new URL('../../config/facetMap.ts', import.meta.url), 'utf8');
  const match = source.match(/export const FILTER_FACETS: FilterFacet\[\] = (\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Could not locate FILTER_FACETS in facetMap.ts');
  return new Function(`return ${match[1]}`)();
}

function loadCatalogueIndex() {
  return JSON.parse(
    readFileSync(new URL('../../../../data/catalogue-index.json', import.meta.url), 'utf8'),
  );
}

const FILTER_FACETS = loadFilterFacets();
const catalogueIndex = loadCatalogueIndex();

// ---------------------------------------------------------------------------
// Catalogue traversal — the accessories node plus every descendant.
// ---------------------------------------------------------------------------

function unrollDescendantKeys(nodeId) {
  const slotMetadataMap = catalogueIndex.slotMetadataMap;
  if (!slotMetadataMap[nodeId]) return [nodeId];

  const collectedIds = new Set();
  const stack = [nodeId];
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

function isPlaceholderVocab(vocab) {
  return vocab.some((v) => v.startsWith('<') && v.endsWith('>'));
}

function facetsForCategory(category) {
  return FILTER_FACETS.filter(
    (f) => f.categories.includes('*') || f.categories.includes(category),
  );
}

function fieldKey(facet) {
  return facet.field.replace('filterAttributes.', '');
}

function facetsUnderTest() {
  return facetsForCategory(CATEGORY).filter(
    (f) => f.type !== 'range' && !EXCLUDED_URL_PARAMS.has(f.urlParam),
  );
}

// ---------------------------------------------------------------------------
// ORACLE — hand-written predicate over the tagged inventory.
// ---------------------------------------------------------------------------

function fieldValues(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map(String);
  return [String(raw)];
}

function priceCents(p) {
  // Mirrors buildProductQuery.ts's own coalesce (written independently):
  // filterAttributes.price is the source of truth once populated;
  // price_data.unit_amount is the fallback for products not yet migrated.
  return p.filterAttributes.price ?? p.priceDataCents ?? null;
}

// Mirrors buildProductQuery.ts's inStock coalesce (written independently):
// a declared boolean wins; the legacy stock arithmetic is the fallback.
function inStockResolved(p) {
  const declared = p.filterAttributes.inStock;
  if (typeof declared === 'boolean') return declared === true;
  return (p.stock ?? 0) - (p.reservedStock ?? 0) > 0;
}

// One active facet entry. `selected` is:
//   boolean facet -> true
//   range facet   -> { min?, max? } (at least one bound present)
//   enum / multi  -> string[] (union within the facet)
function matchesEntry(p, facet, selected) {
  if (facet.urlParam === 'inStock') return inStockResolved(p);
  if (facet.type === 'boolean') return p.filterAttributes[fieldKey(facet)] === true;
  if (facet.type === 'range') {
    const v = p.filterAttributes[fieldKey(facet)];
    if (typeof v !== 'number') return false;
    if (selected.min != null && v < selected.min) return false;
    if (selected.max != null && v > selected.max) return false;
    return true;
  }
  return selected.some((value) =>
    fieldValues(p.filterAttributes[fieldKey(facet)]).some(
      (v) => v.toLowerCase() === String(value).toLowerCase(),
    ),
  );
}

function matchesPrice(p, price) {
  if (!price) return true;
  const cents = priceCents(p);
  if (cents == null) return false;
  if (price.min != null && cents < price.min * 100) return false;
  if (price.max != null && cents > price.max * 100) return false;
  return true;
}

function matchesCase(p, c) {
  return matchesPrice(p, c.price) && c.active.every(({ facet, selected }) => matchesEntry(p, facet, selected));
}

// ---------------------------------------------------------------------------
// Case -> production ProductQueryState translation. Pure calling-convention
// translation (which state key each facet expects) — carries no vocabulary
// or matching logic; the matching logic under test lives in
// buildProductQuery.ts.
// ---------------------------------------------------------------------------

function toProductionState(c) {
  const state = { sort: 'featured', minPrice: null, maxPrice: null, inStock: false };
  for (const { facet, selected } of c.active) {
    if (facet.urlParam === 'inStock') {
      state.inStock = true;
    } else if (facet.type === 'boolean') {
      state[facet.urlParam] = true;
    } else if (facet.type === 'range') {
      if (selected.min != null) state[`${facet.urlParam}Min`] = selected.min;
      if (selected.max != null) state[`${facet.urlParam}Max`] = selected.max;
    } else {
      state[facet.urlParam] = selected.map((v) => String(v).toLowerCase());
    }
  }
  if (c.price?.min != null) state.minPrice = c.price.min;
  if (c.price?.max != null) state.maxPrice = c.price.max;
  return state;
}

// ---------------------------------------------------------------------------
// ACTUAL — the real production query, scoped like the live page.
// ---------------------------------------------------------------------------

async function runActual(c, vfsKeys) {
  const { whereClause, params } = buildProductQuery(toProductionState(c));
  const result = await sanityQuery(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $vfsKeys]) > 0${whereClause}]{ _id }`,
    { vfsKeys, ...params },
  );
  return result.map((r) => r._id);
}

// ---------------------------------------------------------------------------
// Inventory dump — every product TAGGED accessories, unfiltered.
// ---------------------------------------------------------------------------

async function fetchInventory(allFacets) {
  const fields = Array.from(new Set(allFacets.map(fieldKey)));
  const projection = fields.map((f) => `"${f}": filterAttributes.${f}`).join(',\n        ');
  return sanityQuery(
    `*[_type == "product" && "${CATEGORY}" in filterAttributes.category]{
      _id, name,
      "category": filterAttributes.category,
      "priceDataCents": price_data.unit_amount,
      stock, reservedStock,
      "filterAttributes": {
        ${projection}
      }
    }`,
  );
}

// ---------------------------------------------------------------------------
// Case list, driven by the declared vocabularies + observed data.
// ---------------------------------------------------------------------------

function candidateValues(facet, inventory) {
  if (facet.type === 'boolean') return ['true'];
  if (!isPlaceholderVocab(facet.valueVocab)) return facet.valueVocab;
  const seen = new Set();
  for (const p of inventory) {
    for (const v of fieldValues(p.filterAttributes[fieldKey(facet)])) seen.add(v);
  }
  return Array.from(seen);
}

function buildCases(facets, rangeFacets, inventory) {
  const cases = [{ id: 'baseline: no filters', active: [], price: null }];

  // inStock single — coalesce semantics, mirrored independently above.
  const inStockFacet = facetsForCategory(CATEGORY).find((f) => f.urlParam === 'inStock');
  cases.push({ id: 'single: inStock=true', active: [{ facet: inStockFacet, selected: true }], price: null });

  const byFacet = new Map(); // urlParam -> { facet, values }
  for (const facet of facets) {
    const values = candidateValues(facet, inventory);
    if (values.length === 0) continue;
    byFacet.set(facet.urlParam, { facet, values });

    for (const v of values) {
      cases.push({ id: `single: ${facet.urlParam}=${v}`, active: [{ facet, selected: [v] }], price: null });
    }

    // Same-facet unions: every value pair within one facet.
    if (values.length >= 2 && values.length <= SAME_FACET_MAX_CARDINALITY) {
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          cases.push({
            id: `pair-union: ${facet.urlParam}=[${values[i]}, ${values[j]}]`,
            active: [{ facet, selected: [values[i], values[j]] }],
            price: null,
          });
        }
      }
    }
  }

  // Cross-facet intersections: every facet pairing, highest-coverage value each.
  const best = [];
  for (const { facet, values } of byFacet.values()) {
    let bestV = null;
    let bestN = -1;
    for (const v of values) {
      const n = inventory.filter((p) => matchesEntry(p, facet, [v])).length;
      if (n > bestN) { bestV = v; bestN = n; }
    }
    best.push({ facet, value: bestV });
  }
  for (let i = 0; i < best.length; i++) {
    for (let j = i + 1; j < best.length; j++) {
      cases.push({
        id: `pair-intersect: ${best[i].facet.urlParam}=${best[i].value} + ${best[j].facet.urlParam}=${best[j].value}`,
        active: [
          { facet: best[i].facet, selected: [best[i].value] },
          { facet: best[j].facet, selected: [best[j].value] },
        ],
        price: null,
      });
    }
  }

  // Range boundaries: the actual smallest/second-smallest and largest/
  // second-largest values OBSERVED in the real inventory (not invented
  // epsilons) — "just inside" and "just outside" are real distinct points.
  for (const facet of rangeFacets) {
    const observed = (facet.urlParam === 'price'
      ? inventory.map(priceCents)
      : inventory.map((p) => p.filterAttributes[fieldKey(facet)])
    ).filter((v) => typeof v === 'number');
    const values = [...new Set(observed)].sort((a, b) => a - b);
    if (values.length < 2) {
      console.log(`(skipping ${facet.urlParam}: fewer than 2 distinct observed values)`);
      continue;
    }
    const [smallest, secondSmallest] = values;
    const largest = values[values.length - 1];
    const secondLargest = values[values.length - 2];
    const bounds = [
      ['min-inclusive-at-smallest', { min: smallest }],
      ['min-excludes-smallest', { min: secondSmallest }],
      ['max-inclusive-at-largest', { max: largest }],
      ['max-excludes-largest', { max: secondLargest }],
    ];
    for (const [label, selected] of bounds) {
      // The price facet's production contract is minPrice/maxPrice in
      // DOLLARS (filterSortParams.ts); every other range facet uses
      // `${urlParam}Min/Max` in the field's own unit.
      if (facet.urlParam === 'price') {
        cases.push({
          id: `boundary: price:${label}`,
          active: [],
          price: {
            min: selected.min != null ? selected.min / 100 : null,
            max: selected.max != null ? selected.max / 100 : null,
          },
        });
      } else {
        cases.push({ id: `boundary: ${facet.urlParam}:${label}`, active: [{ facet, selected }], price: null });
      }
    }
  }

  return cases;
}

// ---------------------------------------------------------------------------
// Category membership — every product the real query returns must be tagged
// accessories (and never headphones / audio-electronics).
// ---------------------------------------------------------------------------

function membershipViolations(actualIds, tagged) {
  return actualIds.filter((id) => {
    const cat = tagged.get(id);
    return !cat || !cat.includes(CATEGORY) || cat.includes('headphones') || cat.includes('audio-electronics');
  });
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

async function main() {
  const t0 = Date.now();
  const categoryNodeId = catalogueIndex.slugToIdMap[CATEGORY];
  if (!categoryNodeId) throw new Error(`Could not resolve "${CATEGORY}" in data/catalogue-index.json`);
  const vfsKeys = unrollDescendantKeys(categoryNodeId);

  const allFacets = facetsForCategory(CATEGORY);
  const facets = facetsUnderTest();
  const rangeFacets = allFacets.filter((f) => f.type === 'range');

  console.log(`Fetching every product TAGGED "${CATEGORY}" from Sanity (dataset=${process.env.NEXT_PUBLIC_SANITY_DATASET})...`);
  const inventory = await fetchInventory(allFacets);
  writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
  console.log(`${inventory.length} products tagged ${CATEGORY} (oracle universe; dump written to features/product-filtering/__tests__/data/acc-inventory.json).`);
  console.log(`VFS scope: ${vfsKeys.length} catalogue keys under node ${categoryNodeId} (what /products/${CATEGORY} actually serves).`);
  console.log(`Facets under test: ${facets.length} non-range (+ inStock, price) + ${rangeFacets.length} range.\n`);

  const cases = buildCases(facets, rangeFacets, inventory);
  const tagged = new Map(inventory.map((p) => [p._id, p.category || []]));
  console.log(`Cases: ${cases.length} (baseline, singles, boundaries, same-facet unions, cross-facet intersections).\n`);

  // Run every case's REAL query with bounded HTTP concurrency; results are
  // printed below in deterministic case order.
  const results = new Array(cases.length);
  let cursor = 0;
  async function worker() {
    while (cursor < cases.length) {
      const i = cursor++;
      const c = cases[i];
      const expectedSet = new Set(inventory.filter((p) => matchesCase(p, c)).map((p) => p._id));
      let actualIds;
      try {
        actualIds = await runActual(c, vfsKeys);
      } catch (err) {
        results[i] = { caseId: c.id, error: String(err) };
        continue;
      }
      const actualSet = new Set(actualIds);
      const missing = [...expectedSet].filter((id) => !actualSet.has(id));
      const extra = actualIds.filter((id) => !expectedSet.has(id));
      const nonBelonging = membershipViolations(actualIds, tagged);
      const ok = missing.length === 0 && extra.length === 0 && nonBelonging.length === 0;
      results[i] = {
        caseId: c.id,
        expectedCount: expectedSet.size,
        actualCount: actualIds.length,
        missingFromActual: missing,
        unexpectedInActual: extra,
        nonBelongingInActual: nonBelonging,
        pass: ok,
      };
    }
  }
  await Promise.all(Array.from({ length: HTTP_CONCURRENCY }, worker));

  let pass = 0;
  let fail = 0;
  for (const r of results) {
    if (r.error) {
      fail++;
      console.log(`ERROR ${r.caseId}: ${r.error}`);
      continue;
    }
    r.pass ? pass++ : fail++;
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.caseId}  (expected ${r.expectedCount}, actual ${r.actualCount})`);
    if (!r.pass) {
      if (r.missingFromActual.length) console.log(`      missing (should show, didn't): ${JSON.stringify(r.missingFromActual)}`);
      if (r.unexpectedInActual.length) console.log(`      extra   (shown, shouldn't be):  ${JSON.stringify(r.unexpectedInActual)}`);
      if (r.nonBelongingInActual.length) console.log(`      NON-BELONGING (not tagged ${CATEGORY}): ${JSON.stringify(r.nonBelongingInActual)}`);
    }
  }

  writeFileSync(REPORT_FILE, JSON.stringify({
    generatedAt: new Date().toISOString(),
    category: CATEGORY,
    caseCount: results.length,
    pass,
    fail,
    results,
  }, null, 2));

  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${results.length} cases: ${pass} PASS, ${fail} FAIL (${seconds}s).`);
  console.log(fail === 0
    ? `ZERO FAILS — every case: exact subset, no non-belonging product, no missing product. Report: features/product-filtering/__tests__/data/acc-subset-proof-report.json`
    : `${fail} FAIL(S) — see the per-case missing/extra/non-belonging lists above and features/product-filtering/__tests__/data/acc-subset-proof-report.json.`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
