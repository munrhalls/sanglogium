const fs = require('fs');
const path = require('path');

const {
  EXPORT_PATH,
  FACET_MAP_PATH,
  loadJson,
  saveJson,
  getArg,
  loadOrRefreshExport,
  buildIdToRoot,
  productRootCategories,
} = require('./migrate-lib.cjs');

const {
  validateClosedVocab,
  validateConsistency,
  isMigratedValuePresent,
  padEnd,
  padStart,
} = require('./gap-lib.cjs');

const MATRIX_PATH = path.join(__dirname, 'product-facet-applicability-matrix.json');
const HANDOFF_PATH = path.join(__dirname, 'handoff-dataset.json');
const QUEUE_PATH = path.join(__dirname, 'unresolved-queue.json');
const NORMALIZED_PATH = path.join(__dirname, 'normalized-dataset.json');
const REPORT_PATH = path.join(__dirname, 'readiness-report.json');

function isFieldApplicableToProduct(fieldName, matrixRow, facetByName) {
  if (!matrixRow) return null;
  const cell = matrixRow.facets[facetByName.get(fieldName)?.facet];
  if (!cell) return null;
  return cell.state === 'needs value';
}

function validateCategoryApplicability(product, matrixRow, facetByName, fieldName) {
  const facet = facetByName.get(fieldName);
  if (!facet) return null;

  const cell = matrixRow?.facets[facet.facet];
  // If the matrix says N/A for this facet, a value should not be present.
  if (cell && cell.state === 'N/A' && product.filterAttributes?.[fieldName] !== undefined && product.filterAttributes?.[fieldName] !== null) {
    return {
      product: product._id,
      name: product.name,
      rule: 'applicability',
      field: fieldName,
      facet: facet.facet,
      expected: 'N/A',
      got: product.filterAttributes[fieldName],
      reason: cell.reason,
    };
  }
  return null;
}

async function main() {
  const isRefresh = getArg('refresh');
  const isProposed = getArg('proposed');
  const normalized = loadJson(NORMALIZED_PATH);

  // Load current state (refresh from Sanity if asked).
  let products = await loadOrRefreshExport(isRefresh);

  // In proposed mode, replace filterAttributes with the target handoff shape
  // before checking readiness, so we can verify the migration result before
  // any live writes.
  if (isProposed) {
    products = products.map((p) => {
      const attrs = normalized.products[p._id];
      if (attrs === undefined) return p;
      return { ...p, filterAttributes: attrs };
    });
    console.log('📐 Proposed mode: filterAttributes replaced with normalized-dataset.json values.');
  }

  const productById = new Map(products.map((p) => [p._id, p]));

  const facetMap = loadJson(FACET_MAP_PATH);
  const facetByName = new Map(facetMap.map((f) => [f.field.replace('filterAttributes.', ''), f]));
  const facetByDisplay = new Map(facetMap.map((f) => [f.facet, f]));

  const matrix = loadJson(MATRIX_PATH);
  const matrixById = new Map(matrix.matrix.map((r) => [r._id, r]));

  const handoff = loadJson(HANDOFF_PATH);
  const queue = loadJson(QUEUE_PATH);
  const queueSet = new Set(queue.queue.map((item) => `${item._id}::${item.facet}`));

  const visibleIds = matrix.matrix.map((r) => r._id);
  const nonDraftProducts = products.filter((p) => !String(p._id).startsWith('drafts.'));
  const visibleInExport = nonDraftProducts.filter(
    (p) => Array.isArray(p.catalogueLocationKeys) && p.catalogueLocationKeys.length > 0
  ).length;

  const report = {
    generatedAt: new Date().toISOString(),
    liveProducts: products.length,
    visibleProducts: visibleIds.length,
    handoffProducts: handoff.totalProducts,
    missingFromLive: [],
    closedVocabViolations: [],
    consistencyViolations: [],
    applicabilityViolations: [],
    filled: 0,
    na: 0,
    unresolved: 0,
    remainingGaps: [],
    untrackedGaps: [],
    perFacet: {},
  };

  for (const facet of facetMap) {
    report.perFacet[facet.field.replace('filterAttributes.', '')] = {
      facet: facet.facet,
      filled: 0,
      unresolved: 0,
      na: 0,
      inQueue: 0,
    };
  }

  for (const _id of visibleIds) {
    const product = productById.get(_id);
    if (!product) {
      report.missingFromLive.push({ _id, reason: 'Product in applicability matrix but not in live export' });
      continue;
    }

    if (!Array.isArray(product.catalogueLocationKeys) || product.catalogueLocationKeys.length === 0) {
      report.missingFromLive.push({ _id: product._id, reason: 'No catalogueLocationKeys in live export' });
      continue;
    }

    const matrixRow = matrixById.get(_id);
    if (!matrixRow) {
      report.missingFromLive.push({ _id: product._id, reason: 'Product in export but not in applicability matrix' });
      continue;
    }

    // Closed-vocabulary check for every populated filterAttributes field.
    for (const v of validateClosedVocab(product, facetMap)) {
      report.closedVocabViolations.push(v);
    }

    // Cross-consistency check (name/slug heuristics and domain rules).
    for (const v of validateConsistency(product, facetMap)) {
      report.consistencyViolations.push(v);
    }

    // Applicability: a value should not exist on a product where the matrix says N/A.
    for (const fieldName of Object.keys(product.filterAttributes || {})) {
      const v = validateCategoryApplicability(product, matrixRow, facetByName, fieldName);
      if (v) report.applicabilityViolations.push(v);
    }

    // Walk the matrix to reconcile filled vs unresolved vs N/A.
    for (const [facetName, cell] of Object.entries(matrixRow.facets)) {
      const facet = facetByDisplay.get(facetName);
      if (!facet) continue;
      const fieldName = facet.field.replace('filterAttributes.', '');
      const entry = report.perFacet[fieldName];

      if (cell.state === 'N/A') {
        report.na++;
        entry.na++;
        continue;
      }

      const current = product.filterAttributes?.[fieldName];
      if (isMigratedValuePresent(current, facet)) {
        report.filled++;
        entry.filled++;
        continue;
      }

      // Not filled — this is a remaining gap. Trace it to the unresolved queue.
      report.unresolved++;
      entry.unresolved++;

      const gapKey = `${product._id}::${facetName}`;
      const inQueue = queueSet.has(gapKey);
      if (inQueue) entry.inQueue++;

      const gap = {
        _id: product._id,
        name: product.name,
        field: fieldName,
        facet: facetName,
        inQueue,
      };

      if (!inQueue) {
        report.untrackedGaps.push(gap);
      }
      report.remainingGaps.push(gap);
    }
  }

  // Reconcile product counts (already computed as non-draft, catalogue-visible).
  const migratedCount = Object.keys(handoff.products).length;
  const countDrift = migratedCount !== visibleInExport || visibleInExport !== matrix.meta.totalRows;

  // Output
  console.log('=== CMS readiness roll-up ===');
  console.log(`Live /products count (visible): ${visibleInExport}`);
  console.log(`Handoff dataset product count:  ${migratedCount}`);
  console.log(`Applicability matrix rows:      ${matrix.meta.totalRows}`);
  console.log(`Count drift:                    ${countDrift ? 'yes' : 'no'}`);
  if (report.missingFromLive.length > 0) {
    console.log(`Products in matrix but not live: ${report.missingFromLive.length}`);
  }

  console.log(`\nFacet coverage:`);
  console.log(`  Filled:      ${report.filled}`);
  console.log(`  N/A:         ${report.na}`);
  console.log(`  Unresolved:  ${report.unresolved}`);

  console.log(`\nQuality gates:`);
  console.log(`  closed-vocab violations:    ${report.closedVocabViolations.length}`);
  console.log(`  consistency violations:     ${report.consistencyViolations.length}`);
  console.log(`  applicability violations:   ${report.applicabilityViolations.length}`);
  console.log(`  untracked gaps (not in D3): ${report.untrackedGaps.length}`);
  console.log(`  remaining gaps (in D3):     ${report.unresolved - report.untrackedGaps.length}`);

  if (report.closedVocabViolations.length === 0 && report.consistencyViolations.length === 0 &&
      report.applicabilityViolations.length === 0 && report.untrackedGaps.length === 0 &&
      !countDrift) {
    console.log('\n✅ CMS is ready for filter wiring.');
    console.log('   All migrated values are inside the closed vocabulary,');
    console.log('   all consistency and applicability rules pass,');
    console.log('   and every remaining gap is traced to the unresolved-value human queue.');
  } else {
    console.log('\n⚠️ CMS is NOT ready for filter wiring. Review the violations above.');
  }

  // Per-facet breakdown
  console.log('\n=== Per-facet readiness ===');
  const rows = Object.values(report.perFacet).filter((r) => r.filled > 0 || r.unresolved > 0 || r.na > 0);
  for (const row of rows) {
    const pct = row.filled + row.unresolved > 0
      ? Math.round((row.filled / (row.filled + row.unresolved)) * 100)
      : 0;
    console.log(
      `  ${padEnd(row.facet, 22)} filled=${padStart(row.filled, 5)} unresolved=${padStart(row.unresolved, 5)} na=${padStart(row.na, 5)} inQueue=${padStart(row.inQueue, 5)} (${pct}%)`
    );
  }

  // Short remaining-gaps list (first 30) for human triage.
  if (report.remainingGaps.length > 0) {
    console.log(`\n=== Remaining gaps (first 30 of ${report.remainingGaps.length}) ===`);
    for (const g of report.remainingGaps.slice(0, 30)) {
      const marker = g.inQueue ? '✓' : '✗';
      console.log(`  [${marker}] ${padEnd(g._id.slice(0, 24), 26)} ${padEnd(g.field, 22)} ${g.name.slice(0, 60)}`);
    }
    if (report.remainingGaps.length > 30) {
      console.log(`  ... and ${report.remainingGaps.length - 30} more.`);
    }
  }

  saveJson(REPORT_PATH, report);
  console.log(`\nWrote readiness report to ${path.relative(process.cwd(), REPORT_PATH)}`);

  // Non-zero return when readiness is not achieved.
  if (report.closedVocabViolations.length > 0 || report.consistencyViolations.length > 0 ||
      report.applicabilityViolations.length > 0 || report.untrackedGaps.length > 0 || countDrift) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Readiness error:', err.message);
  process.exit(1);
});
