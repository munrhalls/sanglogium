// sang-logium-ajf, step 7 — for every single/boundary/pair case precomputed
// in steps 4-6, call the REAL, unmodified lib/catalogue/buildProductQuery.ts,
// execute its GROQ output against Sanity (scoped to the same 187-product
// headphones universe step 1 established independently), and diff the
// returned ID set against the proven expected set. Exact set equality only.
//
// buildProductQuery.ts is imported directly here ON PURPOSE -- it is the
// thing under test, not the oracle. The FACET_TO_URLPARAM table below is
// purely a calling-contract translation (which ProductQueryState key does
// this function expect for a given facet) -- it carries no vocabulary or
// matching logic, and is the only place this proof touches FILTER_FACETS'
// urlParam naming.
//
// Run: node --experimental-strip-types --loader ./lib/filter-sort/__tests__/tsExtLoader.mjs --env-file=.env.local lib/filter-sort/__tests__/07-diff-against-production.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { sanityQuery } from './sanityRaw.mjs';
import { buildProductQuery } from '../../catalogue/buildProductQuery.ts';

const inventory = JSON.parse(readFileSync(new URL('./data/headphones-inventory.json', import.meta.url), 'utf8'));
const headphonesIds = inventory.map((p) => p._id);

const singles = JSON.parse(readFileSync(new URL('./data/expected-singles.json', import.meta.url), 'utf8'));
const boundaries = JSON.parse(readFileSync(new URL('./data/expected-boundaries.json', import.meta.url), 'utf8'));
const pairs = JSON.parse(readFileSync(new URL('./data/expected-pairs.json', import.meta.url), 'utf8'));

const FACET_TO_URLPARAM = {
  inStockResolved: { urlParam: 'inStock', kind: 'boolean' },
  portable: { urlParam: 'portable', kind: 'boolean' },
  requiresAmplifier: { urlParam: 'requiresAmplifier', kind: 'boolean' },
  microphone: { urlParam: 'microphone', kind: 'boolean' },
  detachableCable: { urlParam: 'detachableCable', kind: 'boolean' },
  foldable: { urlParam: 'foldable', kind: 'boolean' },
  fitType: { urlParam: 'fitType', kind: 'value' },
  connectivity: { urlParam: 'connectivity', kind: 'value' },
  soundSignature: { urlParam: 'soundSignature', kind: 'value' },
  ipxRating: { urlParam: 'ipx', kind: 'value' },
  anc: { urlParam: 'anc', kind: 'value' },
  driverConfigBucket: { urlParam: 'driverConfig', kind: 'value' },
  brand: { urlParam: 'brand', kind: 'value' },
  awards: { urlParam: 'awards', kind: 'value' },
  productCategory: { urlParam: 'productCategory', kind: 'value' },
  wearingStyle: { urlParam: 'wearingStyle', kind: 'value' },
  acousticDesign: { urlParam: 'acousticDesign', kind: 'value' },
  cableTermination: { urlParam: 'cableTermination', kind: 'value' },
  bluetoothCodecs: { urlParam: 'codec', kind: 'value' },
  driverType: { urlParam: 'driverType', kind: 'value' },
  priceCentsResolved: { urlParam: 'price', kind: 'range-price' },
  impedanceOhms: { urlParam: 'impedance', kind: 'range' },
  sensitivityDbMw: { urlParam: 'sensitivity', kind: 'range' },
  freqResponseHzMin: { urlParam: 'bassExtension', kind: 'range' },
  cableLengthM: { urlParam: 'cableLength', kind: 'range' },
  batteryLifeHoursAncOff: { urlParam: 'batteryLife', kind: 'range' },
};

function toProductionState(filterState) {
  const state = { sort: 'featured', minPrice: null, maxPrice: null, inStock: false };
  for (const [facetId, value] of Object.entries(filterState)) {
    const map = FACET_TO_URLPARAM[facetId];
    if (!map) throw new Error(`No production mapping for oracle facet "${facetId}"`);
    if (map.kind === 'boolean') state[map.urlParam] = value === true;
    else if (map.kind === 'value') state[map.urlParam] = value;
    else if (map.kind === 'range-price') {
      if (value.min != null) state.minPrice = value.min / 100;
      if (value.max != null) state.maxPrice = value.max / 100;
    } else if (map.kind === 'range') {
      if (value.min != null) state[`${map.urlParam}Min`] = value.min;
      if (value.max != null) state[`${map.urlParam}Max`] = value.max;
    }
  }
  return state;
}

async function runRealQuery(filterState) {
  const productionState = toProductionState(filterState);
  const { whereClause, params } = buildProductQuery(productionState);
  const query = `*[_type == "product" && _id in $headphonesIds${whereClause}]{_id}`;
  const result = await sanityQuery(query, { ...params, headphonesIds });
  return result.map((r) => r._id).sort();
}

function setsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

async function main() {
  const allCases = [...singles, ...boundaries, ...pairs];
  const report = [];
  let passCount = 0;
  let failCount = 0;

  for (const c of allCases) {
    const actualIds = await runRealQuery(c.filterState);
    const expectedIds = [...c.expectedIds].sort();
    const ok = setsEqual(actualIds, expectedIds);
    if (ok) passCount++; else failCount++;

    const line = {
      caseId: c.caseId,
      filterState: c.filterState,
      expectedCount: expectedIds.length,
      actualCount: actualIds.length,
      result: ok ? 'PASS' : 'FAIL',
    };
    if (!ok) {
      line.missingFromActual = expectedIds.filter((id) => !actualIds.includes(id));
      line.extraInActual = actualIds.filter((id) => !expectedIds.includes(id));
    }
    report.push(line);
    console.log(`${ok ? 'PASS' : 'FAIL'} ${c.caseId} (expected ${expectedIds.length}, actual ${actualIds.length})`);
    if (!ok) {
      console.log(`     missing: ${JSON.stringify(line.missingFromActual)}`);
      console.log(`     extra:   ${JSON.stringify(line.extraInActual)}`);
    }
  }

  writeFileSync(new URL('./data/diff-report.json', import.meta.url), JSON.stringify(report, null, 2));

  console.log(`\n${allCases.length} cases: ${passCount} PASS, ${failCount} FAIL.`);
  console.log(failCount === 0 ? 'ZERO FAILS -- production predicate matches proven expected sets on every single, boundary, and pair case.' : `${failCount} FAILS -- see lib/filter-sort/__tests__/data/diff-report.json`);
  process.exit(failCount === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
