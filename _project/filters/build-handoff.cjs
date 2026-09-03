const fs = require('fs');
const path = require('path');

const { loadJson, saveJson, FACET_MAP_PATH, BASE_DIR, isPlaceholderVocab } = require('./migrate-lib.cjs');

const ACQUIRED_JSON = path.join(BASE_DIR, 'acquired-values.json');
const RESOLVED_JSON = path.join(BASE_DIR, 'resolved-values.json');
const MATRIX_JSON = path.join(BASE_DIR, 'product-facet-applicability-matrix.json');
const QUEUE_JSON = path.join(BASE_DIR, 'unresolved-queue.json');
const HANDOFF_JSON = path.join(BASE_DIR, 'handoff-dataset.json');
const COVERAGE_JSON = path.join(BASE_DIR, 'handoff-coverage.json');

function splitMulti(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((s) => s.trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isBooleanValue(value) {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') return value === 'true' || value === 'false';
  return false;
}

function toBoolean(value) {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return null;
}

function toHandoffValue(value, facet) {
  const fieldName = facet.field.replace('filterAttributes.', '');

  if (fieldName === 'price') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  if (fieldName === 'inStock') {
    return toBoolean(value);
  }

  if (facet.type === 'multi' || (facet.valueVocab && isPlaceholderVocab(facet.valueVocab))) {
    return splitMulti(value);
  }

  if (facet.type === 'boolean') {
    return toBoolean(value);
  }

  if (facet.type === 'range' || facet.type === 'number') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  return String(value).trim();
}

function validateValue(typed, facet, productId, rawValue) {
  const fieldName = facet.field.replace('filterAttributes.', '');

  // Numeric, boolean, and placeholder-backed fields are not validated against a closed vocab.
  if (facet.type === 'range' || facet.type === 'number' || facet.type === 'boolean') return [];
  if (isPlaceholderVocab(facet.valueVocab || [])) return [];

  const allowed = new Set(facet.valueVocab || []);
  const values = Array.isArray(typed) ? typed : [typed];
  const violations = [];

  for (const v of values) {
    if (v === null || v === undefined || v === '') continue;
    if (!allowed.has(v)) {
      violations.push({ product: productId, field: fieldName, facet: facet.facet, raw: rawValue, value: v });
    }
  }

  return violations;
}

function main() {
  // Source files
  const acquired = loadJson(ACQUIRED_JSON);
  const matrix = loadJson(MATRIX_JSON);
  const queue = fs.existsSync(QUEUE_JSON) ? loadJson(QUEUE_JSON) : { total: 0, queue: [] };
  const resolved = fs.existsSync(RESOLVED_JSON) ? loadJson(RESOLVED_JSON) : { applied: 0, resolutions: [] };
  const facetMap = loadJson(FACET_MAP_PATH);

  const matrixById = new Map();
  for (const row of matrix.matrix) matrixById.set(row._id, row);

  // Unresolved queue set and per-facet counts (fallback to direct count from queue)
  const queueSet = new Set();
  const queuePerFacet = {};
  for (const item of queue.queue || []) {
    queueSet.add(`${item._id}::${item.facet}`);
    queuePerFacet[item.facet] = (queuePerFacet[item.facet] || 0) + 1;
  }

  const facetByName = new Map(facetMap.map((f) => [f.facet, f]));

  // Build handoff dataset
  const handoffProducts = {};
  let handoffFacetCount = 0;
  const allViolations = [];

  for (const product of Object.values(acquired.products)) {
    const productId = product._id;
    const matrixRow = matrixById.get(productId);
    const out = {};

    for (const [facetName, data] of Object.entries(product.facets || {})) {
      if (data.status !== 'filled') continue;

      // Skip values for facets that are N/A for this product.
      if (matrixRow && matrixRow.facets[facetName]) {
        if (matrixRow.facets[facetName].state === 'N/A') continue;
      }

      const facet = facetByName.get(facetName);
      if (!facet) {
        console.warn(`Unknown facet "${facetName}" for ${productId}; skipping`);
        continue;
      }

      const rawValue = data.value;
      const typed = toHandoffValue(rawValue, facet);

      if (typed === null || (Array.isArray(typed) && typed.length === 0)) continue;

      const violations = validateValue(typed, facet, productId, rawValue);
      if (violations.length > 0) {
        allViolations.push(...violations);
        continue;
      }

      out[facetName] = typed;
      handoffFacetCount++;
    }

    handoffProducts[productId] = out;
  }

  if (allViolations.length > 0) {
    console.error(`Closed-vocabulary violations: ${allViolations.length}`);
    for (const v of allViolations.slice(0, 20)) {
      console.error(`  ${v.product} :: ${v.facet} = ${JSON.stringify(v.value)} (raw: ${JSON.stringify(v.raw)})`);
    }
    if (allViolations.length > 20) {
      console.error(`  ... and ${allViolations.length - 20} more`);
    }
    process.exit(1);
  }

  const handoff = {
    generatedAt: new Date().toISOString(),
    sourceFiles: [
      path.relative(process.cwd(), ACQUIRED_JSON),
      path.relative(process.cwd(), MATRIX_JSON),
      path.relative(process.cwd(), QUEUE_JSON),
      ...(resolved.applied > 0 ? [path.relative(process.cwd(), RESOLVED_JSON)] : []),
    ],
    resolvedApplied: resolved.applied || 0,
    totalProducts: Object.keys(handoffProducts).length,
    totalFacetValues: handoffFacetCount,
    products: handoffProducts,
  };

  saveJson(HANDOFF_JSON, handoff);

  // Build coverage report
  const byFacet = [];
  let totalApplicable = 0;
  let totalNa = 0;
  let totalWithValue = 0;
  let totalUnresolved = 0;

  for (const facet of facetMap) {
    const facetName = facet.facet;
    let applicable = 0;
    let na = 0;
    let withValue = 0;

    for (const row of matrix.matrix) {
      const cell = row.facets[facetName];
      if (!cell) continue;

      if (cell.state === 'N/A') {
        na++;
        continue;
      }

      if (cell.state === 'needs value') {
        applicable++;
        const product = acquired.products[row._id];
        if (product && product.facets && product.facets[facetName] && product.facets[facetName].status === 'filled') {
          const rawValue = product.facets[facetName].value;
          const typed = toHandoffValue(rawValue, facet);
          if (typed !== null && !(Array.isArray(typed) && typed.length === 0)) {
            withValue++;
          }
        }
      }
    }

    const unresolved = queuePerFacet[facetName] ?? Math.max(0, applicable - withValue);
    const pctFilled = applicable > 0 ? Math.round((withValue / applicable) * 100) : 0;
    const pctUnresolved = applicable > 0 ? Math.round((unresolved / applicable) * 100) : 0;

    totalApplicable += applicable;
    totalNa += na;
    totalWithValue += withValue;
    totalUnresolved += unresolved;

    byFacet.push({
      facet: facetName,
      field: facet.field,
      type: facet.type,
      applicable,
      withValue,
      unresolved,
      na,
      pctFilled,
      pctUnresolved,
    });
  }

  const coverage = {
    generatedAt: new Date().toISOString(),
    sourceFiles: handoff.sourceFiles,
    totalProducts: matrix.meta.totalRows,
    totalApplicable,
    totalNa,
    totalWithValue,
    totalUnresolved,
    pctFilled: totalApplicable > 0 ? Math.round((totalWithValue / totalApplicable) * 100) : 0,
    pctUnresolved: totalApplicable > 0 ? Math.round((totalUnresolved / totalApplicable) * 100) : 0,
    closedVocabViolations: 0,
    byFacet,
  };

  saveJson(COVERAGE_JSON, coverage);

  // Console summary
  console.log('=== Filter attribute handoff ===');
  console.log(`Products:         ${handoff.totalProducts}`);
  console.log(`Facet values:     ${handoff.totalFacetValues}`);
  console.log(`Closed-vocab violations: 0`);
  console.log(`\nOutputs:`);
  console.log(`  ${HANDOFF_JSON}`);
  console.log(`  ${COVERAGE_JSON}`);

  console.log(`\n=== Coverage summary ===`);
  console.log(`Total applicable: ${totalApplicable}`);
  console.log(`With value:       ${totalWithValue}`);
  console.log(`Unresolved:       ${totalUnresolved}`);
  console.log(`N/A:              ${totalNa}`);
  console.log(`Fill rate:        ${coverage.pctFilled}%`);

  console.log(`\nPer facet:`);
  for (const row of byFacet) {
    if (row.applicable === 0 && row.na === 0) continue;
    console.log(
      `  ${row.facet.padEnd(22)} applicable=${String(row.applicable).padStart(4)} value=${String(row.withValue).padStart(4)} unresolved=${String(row.unresolved).padStart(4)} na=${String(row.na).padStart(4)} (${String(row.pctFilled).padStart(3)}%)`
    );
  }
}

main();
