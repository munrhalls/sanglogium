const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const {
  FACET_MAP_PATH,
  loadJson,
  saveJson,
  toStorageValue,
  isPlaceholderVocab,
} = require('./migrate-lib.cjs');

const HANDOFF_PATH = path.join(__dirname, 'handoff-dataset.json');
const NORMALIZED_PATH = path.join(__dirname, 'normalized-dataset.json');
const REPORT_PATH = path.join(__dirname, 'normalization-report.json');
const CHECK_SCHEMA_PATH = path.join(__dirname, 'check-schema.cjs');

function dedupeArray(value) {
  if (!Array.isArray(value)) return [value];
  const seen = new Set();
  const out = [];
  for (const v of value) {
    const s = String(v);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(v);
    }
  }
  return out;
}

function normalizeFacetValue(raw, facet, fieldName) {
  if (raw === null || raw === undefined) return null;

  // Coerce everything into a non-empty array of canonical values.
  let values;
  if (facet.type === 'boolean') {
    if (typeof raw === 'boolean') values = [raw];
    else if (raw === 'true' || raw === true) values = [true];
    else if (raw === 'false' || raw === false) values = [false];
    else values = [];
  } else if (facet.type === 'range' || facet.type === 'number') {
    const n = Number(raw);
    values = Number.isFinite(n) ? [n] : [];
  } else if (facet.type === 'multi' || isPlaceholderVocab(facet.valueVocab || [])) {
    const arr = Array.isArray(raw) ? raw : String(raw).split(',');
    values = arr.map((s) => String(s).trim()).filter(Boolean);
    values = dedupeArray(values);
  } else {
    const s = Array.isArray(raw) ? String(raw[0]).trim() : String(raw).trim();
    values = s ? [s] : [];
  }

  if (values.length === 0) return null;

  const storage = toStorageValue(values, facet.type, fieldName);
  return storage;
}

function validateStorageValue(storage, facet, fieldName) {
  if (storage === null || storage === undefined) return true;

  // Placeholder-backed fields (brand, compatibility) are free-text, but the schema
  // still expects an array of strings.
  if (isPlaceholderVocab(facet.valueVocab || [])) {
    if (fieldName === 'brand' || fieldName === 'category' || fieldName === 'compatibility') {
      return Array.isArray(storage) && storage.every((v) => typeof v === 'string' && v.length > 0);
    }
  }

  if (facet.type === 'range' || facet.type === 'number') return typeof storage === 'number';
  if (facet.type === 'boolean') return typeof storage === 'boolean';

  const allowed = new Set(facet.valueVocab || []);
  const values = Array.isArray(storage) ? storage : [storage];
  for (const v of values) {
    if (v === undefined || v === null) continue;
    if (!allowed.has(String(v))) return false;
  }
  return true;
}

function main() {
  // Layer 0: make sure the facet map still lines up byte-for-byte with the schema.
  console.log('🔍 Running schema/facet-map bijection check...');
  try {
    execSync(`node "${CHECK_SCHEMA_PATH}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error('\n❌ Schema check failed. Fix facet-map.json or productType.ts before normalizing.');
    process.exit(1);
  }

  const handoff = loadJson(HANDOFF_PATH);
  const facetMap = loadJson(FACET_MAP_PATH);
  const facetByName = new Map(facetMap.map((f) => [f.facet, f]));

  const normalized = {
    generatedAt: new Date().toISOString(),
    source: path.relative(process.cwd(), HANDOFF_PATH),
    schema: 'filterAttributes',
    totalProducts: 0,
    totalValues: 0,
    products: {},
  };

  const report = {
    generatedAt: normalized.generatedAt,
    handoffProducts: handoff.totalProducts,
    handoffValues: handoff.totalFacetValues,
    normalizedProducts: 0,
    normalizedValues: 0,
    droppedValues: 0,
    violations: [],
    blockers: [],
    perFacet: {},
  };

  for (const [productId, handoffFacets] of Object.entries(handoff.products)) {
    const filterAttributes = {};
    let valueCount = 0;

    for (const [facetName, rawValue] of Object.entries(handoffFacets)) {
      report.perFacet[facetName] = report.perFacet[facetName] || {
        handoff: 0,
        normalized: 0,
        dropped: 0,
        violations: 0,
      };
      report.perFacet[facetName].handoff++;

      const facet = facetByName.get(facetName);
      if (!facet) {
        report.blockers.push({ product: productId, facet: facetName, reason: 'Facet not found in facet-map.json' });
        report.perFacet[facetName].dropped++;
        continue;
      }

      const fieldName = facet.field.replace('filterAttributes.', '');

      const storage = normalizeFacetValue(rawValue, facet, fieldName);
      if (storage === null || storage === undefined) {
        report.droppedValues++;
        report.perFacet[facetName].dropped++;
        continue;
      }

      if (!validateStorageValue(storage, facet, fieldName)) {
        const values = Array.isArray(storage) ? storage : [storage];
        for (const v of values) {
          if (v === undefined || v === null) continue;
          if (isPlaceholderVocab(facet.valueVocab || [])) continue;
          const allowed = facet.valueVocab || [];
          report.violations.push({
            product: productId,
            field: fieldName,
            facet: facetName,
            value: v,
            allowed,
          });
        }
        report.perFacet[facetName].violations++;
        report.droppedValues++;
        continue;
      }

      filterAttributes[fieldName] = storage;
      valueCount++;
      report.normalizedValues++;
      report.perFacet[facetName].normalized++;
    }

    if (Object.keys(filterAttributes).length > 0) {
      normalized.products[productId] = filterAttributes;
      normalized.totalProducts++;
    }
  }

  normalized.totalValues = report.normalizedValues;

  saveJson(NORMALIZED_PATH, normalized);
  saveJson(REPORT_PATH, report);

  console.log('\n=== Normalization report ===');
  console.log(`Handoff products:  ${report.handoffProducts}`);
  console.log(`Handoff values:    ${report.handoffValues}`);
  console.log(`Normalized values: ${report.normalizedValues}`);
  console.log(`Dropped values:    ${report.droppedValues}`);
  console.log(`closed-vocab violations: ${report.violations.length}`);
  console.log(`blockers:          ${report.blockers.length}`);

  if (report.violations.length > 0) {
    console.log('\nClosed-vocabulary violations:');
    for (const v of report.violations.slice(0, 20)) {
      console.log(`  ${v.product} :: ${v.field} = ${JSON.stringify(v.value)}`);
    }
    if (report.violations.length > 20) {
      console.log(`  ... and ${report.violations.length - 20} more`);
    }
  }

  if (report.blockers.length > 0) {
    console.log('\nBlockers (no matching schema field):');
    for (const b of report.blockers) {
      console.log(`  ${b.product} :: ${b.facet}`);
    }
  }

  console.log(`\nOutputs:`);
  console.log(`  ${NORMALIZED_PATH}`);
  console.log(`  ${REPORT_PATH}`);

  if (report.violations.length > 0 || report.blockers.length > 0) {
    console.error('\n❌ Normalization failed. Fix the handoff dataset or schema and re-run.');
    process.exit(1);
  }

  console.log('\n✅ Normalization complete. Closed-vocab violations: 0');
}

main();
