const {
  BASE_DIR,
  EXPORT_PATH,
  FACET_MAP_PATH,
  GROUPS,
  DIRECT_FIELDS,
  loadJson,
  getArg,
  getArgValue,
  getFieldNamesForGroup,
  getSanityClient,
  loadOrRefreshExport,
  buildIdToRoot,
  productRootCategories,
  FIELD_EXTRACTORS,
  FIELD_TITLE_CANDIDATES,
  mappableValues,
  toStorageValue,
  isPlaceholderVocab,
} = require('./migrate-lib.cjs');

const path = require('path');
const fs = require('fs');

// ── helpers ──

function padEnd(str, len) {
  return String(str).padEnd(len, ' ');
}

function padStart(str, len) {
  return String(str).padStart(len, ' ');
}

function findFirstFieldTitle(product, candidates) {
  const all = [
    ...(product.overviewFields || []),
    ...(product.specifications || []),
  ];
  for (const item of all) {
    const title = (item.title || '').trim();
    if (candidates.some((c) => title.toLowerCase() === c.toLowerCase())) {
      return title;
    }
  }
  return null;
}

function getFieldSource(fieldName, product, idToRoot) {
  if (fieldName === 'featuredPriority') {
    return {
      title: 'displayPriority',
      raw: product.displayPriority,
      storage:
        product.displayPriority !== undefined && product.displayPriority !== null
          ? Number(product.displayPriority)
          : null,
      canonical: product.displayPriority !== undefined && product.displayPriority !== null ? [String(product.displayPriority)] : [],
      isMapped: product.displayPriority !== undefined && product.displayPriority !== null && Number.isFinite(Number(product.displayPriority)),
      unmapped: product.displayPriority !== undefined && product.displayPriority !== null && Number.isFinite(Number(product.displayPriority)) ? [] : [String(product.displayPriority)],
    };
  }

  if (fieldName === 'price') {
    const n = Number(product.price);
    return {
      title: 'price_data.unit_amount',
      raw: product.price,
      storage: Number.isFinite(n) ? n : null,
      canonical: Number.isFinite(n) ? [String(product.price)] : [],
      isMapped: Number.isFinite(n),
      unmapped: Number.isFinite(n) ? [] : [String(product.price)],
    };
  }

  if (fieldName === 'brand') {
    return {
      title: 'brand->slug.current',
      raw: product.brandSlug,
      storage: product.brandSlug ? [product.brandSlug] : null,
      canonical: product.brandSlug ? [product.brandSlug] : [],
      isMapped: !!product.brandSlug,
      unmapped: product.brandSlug ? [] : [product.brandSlug],
    };
  }

  if (fieldName === 'inStock') {
    if (product.stock === undefined || product.stock === null) {
      return { title: 'stock - reservedStock', raw: null, storage: null, canonical: [], isMapped: false, unmapped: [] };
    }
    const reserved = product.reservedStock || 0;
    const inStock = product.stock - reserved > 0;
    const raw = inStock ? 'true' : 'false';
    return {
      title: 'stock - reservedStock',
      raw,
      storage: inStock,
      canonical: [raw],
      isMapped: true,
      unmapped: [],
    };
  }

  if (fieldName === 'category') {
    const roots = productRootCategories(product, idToRoot);
    const slugs = roots.map((name) => {
      if (name === 'Headphones') return 'headphones';
      if (name === 'Audio Electronics') return 'audio-electronics';
      if (name === 'Accessories') return 'accessories';
      return null;
    }).filter(Boolean);
    return {
      title: 'catalogueLocationKeys',
      raw: roots.join(', '),
      storage: slugs.length ? slugs : null,
      canonical: slugs,
      isMapped: slugs.length > 0,
      unmapped: [],
    };
  }

  const extractor = FIELD_EXTRACTORS[fieldName];
  if (!extractor) {
    return { title: null, raw: null, storage: null, canonical: [], isMapped: false, unmapped: [] };
  }

  const raw = extractor(product, idToRoot);
  if (!raw) {
    return { title: null, raw: null, storage: null, canonical: [], isMapped: false, unmapped: [] };
  }

  const title = findFirstFieldTitle(product, FIELD_TITLE_CANDIDATES[fieldName] || []);

  const facetMap = loadJson(FACET_MAP_PATH);
  const facet = facetMap.find((f) => f.field === `filterAttributes.${fieldName}`);

  if (!facet) {
    return { title, raw, storage: null, canonical: [], isMapped: false, unmapped: [raw] };
  }

  const result = mappableValues(raw, facet, fieldName);
  const storage = toStorageValue(result.values, facet.type, fieldName);

  return {
    title: title || FIELD_TITLE_CANDIDATES[fieldName].join(' / '),
    raw,
    storage,
    canonical: result.values,
    isMapped: result.values.length > 0,
    unmapped: result.unmapped,
  };
}

function getProposedChanges(product, fieldNames, idToRoot, existing) {
  const changes = {};
  const filterAttrs = {};
  const sortAttrs = {};

  for (const fieldName of fieldNames) {
    const source = getFieldSource(fieldName, product, idToRoot);
    if (!source.isMapped) continue;

    if (fieldName === 'featuredPriority') {
      sortAttrs.featuredPriority = source.storage;
      changes[`sortAttributes.featuredPriority`] = source;
      continue;
    }

    const facetMap = loadJson(FACET_MAP_PATH);
    const facet = facetMap.find((f) => f.field === `filterAttributes.${fieldName}`);

    // Skip setting a value that is already the same in Sanity.
    const existingFilter = existing?.filterAttributes || {};
    const current = existingFilter[fieldName];
    const isSame = isSameValue(current, source.storage);
    if (isSame) continue;

    filterAttrs[fieldName] = source.storage;
    changes[`filterAttributes.${fieldName}`] = source;
  }

  return { filterAttrs, sortAttrs, changes };
}

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

// ── main ──

async function main() {
  const isDryRun = !getArg('apply');
  const isRefresh = getArg('refresh');
  const group = getArgValue('group');

  if (isDryRun) {
    console.log('🚀 Running migration in DRY-RUN mode. No data will be modified.');
  } else {
    console.log('🚀 Running migration in APPLY mode. Data will be modified.');
  }

  if (isRefresh) {
    console.log('--refresh: a fresh export will be pulled from Sanity before migrating.');
  }

  if (!isDryRun && !group) {
    console.error('❌ APPLY mode requires --group <headphones|audio-electronics|shared|sort> to migrate one facet group at a time.');
    process.exit(1);
  }

  const fieldNames = getFieldNamesForGroup(group || 'all');
  const groupLabel = group || 'all';
  console.log(`Group: ${groupLabel} -> ${fieldNames.length} field(s): ${fieldNames.join(', ')}`);

  const products = await loadOrRefreshExport(isRefresh);
  const idToRoot = buildIdToRoot();

  const facetMap = loadJson(FACET_MAP_PATH);

  const perProductSummary = [];
  const perFieldFillCount = {};
  const allUnmapped = [];
  let outsideClosedVocab = 0;
  let affectedCount = 0;

  for (const fieldName of fieldNames) {
    perFieldFillCount[fieldName] = 0;
  }

  for (const product of products) {
    if (!Array.isArray(product.catalogueLocationKeys) || product.catalogueLocationKeys.length === 0) continue;
    if (productRootCategories(product, idToRoot).length === 0) continue;

    const { filterAttrs, sortAttrs, changes } = getProposedChanges(product, fieldNames, idToRoot, product);

    if (Object.keys(changes).length === 0) continue;

    affectedCount++;

    // Per-product output
    console.log(`\n${product.name} (${product._id})`);
    for (const [key, source] of Object.entries(changes)) {
      console.log(`  ${key}: from "${source.title}" = ${JSON.stringify(source.raw)} -> ${JSON.stringify(source.storage)}`);

      const fieldName = key.includes('sortAttributes') ? 'featuredPriority' : key.replace('filterAttributes.', '');
      perFieldFillCount[fieldName]++;

      // Validate that canonical values are inside the closed vocab (skip placeholder fields).
      if (!DIRECT_FIELDS.has(fieldName) && fieldName !== 'compatibility') {
        const facet = facetMap.find((f) => f.field === `filterAttributes.${fieldName}`);
        if (facet && !isPlaceholderVocab(facet.valueVocab || [])) {
          const allowed = new Set(facet.valueVocab || []);
          if (facet.type === 'boolean') {
            allowed.add(true);
            allowed.add(false);
          }
          for (const v of source.canonical || []) {
            if (!allowed.has(v)) {
              outsideClosedVocab++;
              allUnmapped.push({ product: product._id, field: fieldName, raw: source.raw, value: v });
            }
          }
        }
      }

      if (source.unmapped && source.unmapped.length > 0) {
        for (const u of source.unmapped) {
          if (u && u.trim && u.trim().length > 0) {
            allUnmapped.push({ product: product._id, field: fieldName, raw: u });
          }
        }
      }
    }

    perProductSummary.push({ _id: product._id, name: product.name, changes: Object.keys(changes) });
  }

  // Summary
  console.log(`\n=== Migration summary (group: ${groupLabel}) ===`);
  console.log(`products in export: ${products.length}`);
  console.log(`products affected: ${affectedCount}`);
  console.log('\nper-field fill count:');
  for (const [fieldName, count] of Object.entries(perFieldFillCount)) {
    console.log(`  ${padEnd(fieldName, 22)} ${padStart(count, 4)}`);
  }
  console.log(`\nvalues outside closed vocab: ${outsideClosedVocab}`);

  if (allUnmapped.length > 0) {
    console.log(`\nunmapped raw values: ${allUnmapped.length}`);
    for (const u of allUnmapped.slice(0, 20)) {
      console.log(`  ${u.field}: ${JSON.stringify(u.raw)} (product: ${u.product})`);
    }
    if (allUnmapped.length > 20) {
      console.log(`  ... and ${allUnmapped.length - 20} more. Run _project/filters/normalize-report.cjs for the full list.`);
    }
  } else {
    console.log('\nunmapped raw values: 0');
  }

  if (!isDryRun) {
    if (outsideClosedVocab > 0) {
      console.error('\n❌ Refusing to apply because values outside the closed vocab were proposed. Review the dry-run.');
      process.exit(1);
    }

    console.log('\n⚙️  Preparing Sanity transaction...');
    const client = getSanityClient();
    const transaction = client.transaction();
    let patchCount = 0;

    for (const product of products) {
      const { filterAttrs, sortAttrs } = getProposedChanges(product, fieldNames, idToRoot, product);
      if (Object.keys(filterAttrs).length === 0 && Object.keys(sortAttrs).length === 0) continue;

      const patchSet = {};
      for (const [k, v] of Object.entries(filterAttrs)) {
        patchSet[`filterAttributes.${k}`] = v;
      }
      for (const [k, v] of Object.entries(sortAttrs)) {
        patchSet[`sortAttributes.${k}`] = v;
      }

      transaction.patch(product._id, (patch) => patch.set(patchSet));
      patchCount++;
    }

    console.log(`Committing ${patchCount} patches...`);
    const result = await transaction.commit();
    console.log(`✅ Applied migration. ${result.results.length} documents updated.`);
    console.log('\nNext step: run _project/filters/coverage.cjs --refresh to verify migrated coverage.');
  } else {
    console.log('\n🏁 Dry-run finished. Review the log above, then run with --apply to persist.');
  }
}

main().catch((err) => {
  console.error('❌ Migration error:', err.message);
  process.exit(1);
});
