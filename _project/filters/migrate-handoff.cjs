const fs = require('fs');
const path = require('path');

const {
  BASE_DIR,
  EXPORT_PATH,
  loadJson,
  saveJson,
  getArg,
  getArgValue,
  loadOrRefreshExport,
  getSanityClient,
} = require('./migrate-lib.cjs');

const NORMALIZED_PATH = path.join(__dirname, 'normalized-dataset.json');
const SNAPSHOT_PATH = path.join(__dirname, 'rollback-snapshot.json');
const LOG_PATH = path.join(__dirname, 'migration-log.json');

function isSameValue(a, b) {
  if (a === b) return true;
  if (a === undefined || a === null) return b === undefined || b === null;
  if (b === undefined || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b;
  }
  return false;
}

function classifyPatch(currentFilterAttributes, proposedFilterAttributes) {
  const adds = {};
  const changes = {};
  const noOps = {};
  const removes = {};

  const current = currentFilterAttributes || {};

  // Any field in the handoff that is missing or different becomes a set.
  for (const [field, value] of Object.entries(proposedFilterAttributes)) {
    const existing = current[field];
    if (existing === undefined || existing === null) {
      adds[field] = value;
    } else if (!isSameValue(existing, value)) {
      changes[field] = { from: existing, to: value };
    } else {
      noOps[field] = value;
    }
  }

  // Any field currently in filterAttributes that is not in the handoff is a
  // leftover from ylz L3/L4. It must be unset so the final shape is the exact
  // handoff shape.
  for (const field of Object.keys(current)) {
    if (!(field in proposedFilterAttributes)) {
      removes[field] = current[field];
    }
  }

  return { adds, changes, noOps, removes };
}

function saveRollbackSnapshot() {
  if (!fs.existsSync(EXPORT_PATH)) {
    throw new Error(`Cannot create rollback snapshot: ${EXPORT_PATH} does not exist.`);
  }
  fs.copyFileSync(EXPORT_PATH, SNAPSHOT_PATH);
  console.log(`📝 Rollback snapshot saved to ${path.relative(process.cwd(), SNAPSHOT_PATH)}`);
}

async function main() {
  const isDryRun = !getArg('apply');
  const isRefresh = getArg('refresh');
  const limit = Number(getArgValue('limit') || '20');

  if (isDryRun) {
    console.log('🚀 Running handoff migration in DRY-RUN mode. No data will be modified.');
  } else {
    console.log('🚀 Running handoff migration in APPLY mode. Data will be modified.');
  }

  if (!fs.existsSync(NORMALIZED_PATH)) {
    console.error(`❌ Missing normalized dataset. Run node _project/filters/normalize-handoff.cjs first.`);
    process.exit(1);
  }

  const normalized = loadJson(NORMALIZED_PATH);

  // Load (or refresh) the current export. This is the "fresh export" the dry-run is checked against.
  const products = await loadOrRefreshExport(isRefresh);
  const productById = new Map(products.map((p) => [p._id, p]));

  // Always keep a rollback snapshot of the state before any real run.
  saveRollbackSnapshot();

  const missing = [];
  const perProduct = [];
  const perFieldCount = { add: {}, change: {}, noOp: {}, remove: {} };
  const addCount = {};
  const changeCount = {};
  const noOpCount = {};
  const removeCount = {};
  let addTotal = 0;
  let changeTotal = 0;
  let noOpTotal = 0;
  let removeTotal = 0;
  let untouched = 0;

  for (const [productId, proposed] of Object.entries(normalized.products)) {
    const product = productById.get(productId);
    if (!product) {
      missing.push({ _id: productId, reason: 'Product not found in current dataset export' });
      continue;
    }

    const current = product.filterAttributes || {};
    const { adds, changes, noOps, removes } = classifyPatch(current, proposed);

    const hasWork = Object.keys(adds).length > 0 || Object.keys(changes).length > 0 || Object.keys(removes).length > 0;

    if (!hasWork) {
      untouched++;
    }

    const patchSet = {};
    const unsetPaths = [];

    for (const [field, value] of Object.entries(adds)) {
      patchSet[`filterAttributes.${field}`] = value;
      addCount[field] = (addCount[field] || 0) + 1;
      addTotal++;
    }
    for (const [field, { to }] of Object.entries(changes)) {
      patchSet[`filterAttributes.${field}`] = to;
      changeCount[field] = (changeCount[field] || 0) + 1;
      changeTotal++;
    }
    for (const field of Object.keys(noOps)) {
      noOpCount[field] = (noOpCount[field] || 0) + 1;
      noOpTotal++;
    }
    for (const [field, value] of Object.entries(removes)) {
      unsetPaths.push(`filterAttributes.${field}`);
      removeCount[field] = (removeCount[field] || 0) + 1;
      removeTotal++;
    }

    for (const k of Object.keys(adds)) perFieldCount.add[k] = (perFieldCount.add[k] || 0) + 1;
    for (const k of Object.keys(changes)) perFieldCount.change[k] = (perFieldCount.change[k] || 0) + 1;
    for (const k of Object.keys(noOps)) perFieldCount.noOp[k] = (perFieldCount.noOp[k] || 0) + 1;
    for (const k of Object.keys(removes)) perFieldCount.remove[k] = (perFieldCount.remove[k] || 0) + 1;

    if (Object.keys(patchSet).length > 0 || unsetPaths.length > 0) {
      perProduct.push({
        _id: productId,
        name: product.name,
        patchSet,
        unsetPaths,
        adds,
        changes,
        removes,
      });
    }
  }

  // Per-product output (respecting limit to keep console readable)
  for (const item of perProduct.slice(0, limit)) {
    console.log(`\n${item.name} (${item._id})`);
    if (item.adds && Object.keys(item.adds).length > 0) {
      for (const [field, value] of Object.entries(item.adds)) {
        console.log(`  [add] filterAttributes.${field}: ${JSON.stringify(value)}`);
      }
    }
    if (item.changes && Object.keys(item.changes).length > 0) {
      for (const [field, { from, to }] of Object.entries(item.changes)) {
        console.log(`  [change] filterAttributes.${field}: ${JSON.stringify(from)} -> ${JSON.stringify(to)}`);
      }
    }
    if (item.removes && Object.keys(item.removes).length > 0) {
      for (const field of Object.keys(item.removes)) {
        console.log(`  [unset] filterAttributes.${field}`);
      }
    }
  }
  if (perProduct.length > limit) {
    console.log(`\n... and ${perProduct.length - limit} more affected products.`);
  }

  const summary = {
    mode: isDryRun ? 'dry-run' : 'apply',
    generatedAt: new Date().toISOString(),
    source: path.relative(process.cwd(), NORMALIZED_PATH),
    rollbackSnapshot: path.relative(process.cwd(), SNAPSHOT_PATH),
    totalInDataset: Object.keys(normalized.products).length,
    totalInExport: products.length,
    matched: Object.keys(normalized.products).length - missing.length,
    missing: missing.length,
    affected: perProduct.length,
    untouched,
    addTotal,
    changeTotal,
    noOpTotal,
    removeTotal,
    addCount,
    changeCount,
    noOpCount,
    removeCount,
    missingProducts: missing,
    affectedProducts: perProduct.map((p) => ({
      _id: p._id,
      name: p.name,
      patch: p.patch,
    })),
  };

  console.log(`\n=== Migration summary (${summary.mode}) ===`);
  console.log(`Products in normalized dataset: ${summary.totalInDataset}`);
  console.log(`Products in current export:     ${summary.totalInExport}`);
  console.log(`Matched products:               ${summary.matched}`);
  console.log(`Missing from export:            ${summary.missing}`);
  console.log(`Affected products:              ${summary.affected}`);
  console.log(`Untouched products:             ${summary.untouched}`);
  console.log(`\nPer-field patch counts:`);
  console.log(`  Total adds:    ${addTotal}`);
  console.log(`  Total changes: ${changeTotal}`);
  console.log(`  Total removes: ${removeTotal}`);
  console.log(`  Total no-ops:  ${noOpTotal}`);

  if (Object.keys(addCount).length > 0) {
    console.log('\nAdd counts:');
    for (const [field, count] of Object.entries(addCount)) {
      console.log(`  ${field}: ${count}`);
    }
  }
  if (Object.keys(changeCount).length > 0) {
    console.log('\nChange counts:');
    for (const [field, count] of Object.entries(changeCount)) {
      console.log(`  ${field}: ${count}`);
    }
  }
  if (Object.keys(removeCount).length > 0) {
    console.log('\nRemove counts:');
    for (const [field, count] of Object.entries(removeCount).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${field}: ${count}`);
    }
  }

  if (missing.length > 0) {
    console.log(`\n⚠ Products in dataset but not in export (reconciliation required): ${missing.length}`);
    for (const m of missing.slice(0, 20)) {
      console.log(`  ${m._id}: ${m.reason}`);
    }
    if (missing.length > 20) {
      console.log(`  ... and ${missing.length - 20} more.`);
    }
  }

  if (!isDryRun) {
    if (perProduct.length === 0) {
      console.log('\n🏁 Nothing to apply. All products are already in the target state.');
      saveJson(LOG_PATH, summary);
      return;
    }

    console.log('\n⚙️ Preparing Sanity transaction...');
    const client = getSanityClient();
    const transaction = client.transaction();
    let patchCount = 0;

    for (const product of products) {
      const proposed = normalized.products[product._id];
      if (!proposed) continue;

      const current = product.filterAttributes || {};
      const { adds, changes, removes } = classifyPatch(current, proposed);
      const patchSet = {};

      for (const [field, value] of Object.entries(adds)) {
        patchSet[`filterAttributes.${field}`] = value;
      }
      for (const [field, { to }] of Object.entries(changes)) {
        patchSet[`filterAttributes.${field}`] = to;
      }

      const unsetPaths = Object.keys(removes).map((field) => `filterAttributes.${field}`);

      if (Object.keys(patchSet).length === 0 && unsetPaths.length === 0) continue;

      transaction.patch(product._id, (patch) => {
        if (Object.keys(patchSet).length > 0) patch.set(patchSet);
        if (unsetPaths.length > 0) patch.unset(unsetPaths);
        return patch;
      });
      patchCount++;
    }

    console.log(`Committing ${patchCount} patches...`);
    const result = await transaction.commit();
    console.log(`✅ Applied migration. ${result.results.length} documents updated.`);
    console.log('\nNext step: run _project/filters/readiness-handoff.cjs to verify the migration.');

    summary.committedPatches = patchCount;
    summary.committedDocuments = result.results.length;
  } else {
    console.log('\n🏁 Dry-run finished. Review the log above, then run with --apply to persist.');
  }

  saveJson(LOG_PATH, summary);
}

main().catch((err) => {
  console.error('❌ Migration error:', err.message);
  process.exit(1);
});
