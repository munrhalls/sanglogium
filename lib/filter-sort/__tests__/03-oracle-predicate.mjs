// sang-logium-ajf, step 3 — hand-written, independent predicate function.
// Facet ids below are the raw filterAttributes/schema field names (read
// directly from sanity-cms/schemaTypes/productType.ts this session), NOT
// FILTER_FACETS' urlParam vocabulary -- this module has zero knowledge of
// lib/catalogue/facetMap.ts, buildProductQuery.ts, or productMatchesState.
// Each facet's TYPE (boolean/enum/multi/range) was independently decided from
// the schema's own field type (string+options.list -> enum, array -> multi,
// boolean -> boolean, number -> range), not copied from facetMap.ts's `type`.
//
// Semantics (chosen independently, the only sane reading for a shopper filter):
//  - boolean: filter true  -> product's field must be === true.
//  - enum:    filter [values] -> product's scalar field must equal one of them
//             (case-insensitive; a shopper's selection shouldn't be case-sensitive).
//  - multi:   filter [values] -> product's array field must overlap with them
//             (case-insensitive; array can hold 0..n of the vocab).
//  - range:   filter {min?,max?} -> product's numeric value must be >= min and
//             <= max where given; a missing product value never matches an
//             active bound (can't satisfy a numeric constraint with no number).

export const FACET_DEFS = {
  // booleans
  inStockResolved: { kind: 'boolean' },
  portable: { kind: 'boolean' },
  requiresAmplifier: { kind: 'boolean' },
  microphone: { kind: 'boolean' },
  detachableCable: { kind: 'boolean' },
  foldable: { kind: 'boolean' },
  // scalar enums
  fitType: { kind: 'enum' },
  connectivity: { kind: 'enum' },
  soundSignature: { kind: 'enum' },
  ipxRating: { kind: 'enum' },
  anc: { kind: 'enum' },
  driverConfigBucket: { kind: 'enum' },
  // multi (array-overlap)
  brand: { kind: 'multi' },
  awards: { kind: 'multi' },
  productCategory: { kind: 'multi' },
  wearingStyle: { kind: 'multi' },
  acousticDesign: { kind: 'multi' },
  cableTermination: { kind: 'multi' },
  bluetoothCodecs: { kind: 'multi' },
  driverType: { kind: 'multi' },
  // ranges
  priceCentsResolved: { kind: 'range' },
  impedanceOhms: { kind: 'range' },
  sensitivityDbMw: { kind: 'range' },
  freqResponseHzMin: { kind: 'range' },
  cableLengthM: { kind: 'range' },
  batteryLifeHoursAncOff: { kind: 'range' },
};

function lower(v) {
  return String(v).toLowerCase();
}

function matchesOneFacet(product, facetId, def, filterValue) {
  if (filterValue == null) return true; // facet not active

  if (def.kind === 'boolean') {
    if (filterValue !== true) return true; // only "true" toggles are active filters
    return product[facetId] === true;
  }

  if (def.kind === 'enum') {
    const selected = (Array.isArray(filterValue) ? filterValue : [filterValue]).map(lower);
    if (selected.length === 0) return true;
    const productValue = product[facetId];
    if (productValue == null) return false;
    return selected.includes(lower(productValue));
  }

  if (def.kind === 'multi') {
    const selected = (Array.isArray(filterValue) ? filterValue : [filterValue]).map(lower);
    if (selected.length === 0) return true;
    // Real data check (this session): some "array" facet fields are stored as
    // a bare scalar string on individual documents instead of a one-element
    // array -- normalize both shapes rather than assume the schema's declared
    // array type always holds in practice.
    const raw = product[facetId];
    const productValues = (Array.isArray(raw) ? raw : raw != null ? [raw] : []).map(lower);
    return productValues.some((v) => selected.includes(v));
  }

  if (def.kind === 'range') {
    const { min, max } = filterValue;
    const productValue = product[facetId];
    if (min != null || max != null) {
      if (productValue == null) return false;
      if (min != null && productValue < min) return false;
      if (max != null && productValue > max) return false;
    }
    return true;
  }

  throw new Error(`Unknown facet kind for ${facetId}`);
}

/** filterState: { [facetId]: true | string | string[] | {min?, max?} } */
export function matchesFilter(product, filterState) {
  for (const [facetId, def] of Object.entries(FACET_DEFS)) {
    if (!matchesOneFacet(product, facetId, def, filterState[facetId])) return false;
  }
  return true;
}

export function runFilter(inventory, filterState) {
  return inventory.filter((p) => matchesFilter(p, filterState)).map((p) => p._id).sort();
}

// Standalone run: node lib/filter-sort/__tests__/03-oracle-predicate.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs');
  const inventory = JSON.parse(
    readFileSync(new URL('./data/headphones-inventory.json', import.meta.url), 'utf8'),
  );
  const sampleFilter = { connectivity: 'wireless' };
  const ids = runFilter(inventory, sampleFilter);
  console.log(`Sample filter: ${JSON.stringify(sampleFilter)}`);
  console.log(`Matched ${ids.length} of ${inventory.length} products:`);
  console.log(ids);
}
