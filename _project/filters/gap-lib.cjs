const {
  loadJson,
  saveJson,
  buildIdToRoot,
  productRootCategories,
  toStorageValue,
  mappableValues,
  normalizeSlug,
  normalizeCompressed,
  findFirstFieldValue,
  isPlaceholderVocab,
  ROOT_SLUGS,
  EXPORT_PATH,
  FACET_MAP_PATH,
} = require('./migrate-lib.cjs');

const path = require('path');
const fs = require('fs');

let matrixMapCache = null;
function getMatrixMap() {
  if (matrixMapCache !== null) return matrixMapCache;
  const matrixPath = path.join(__dirname, 'product-facet-applicability-matrix.json');
  if (!fs.existsSync(matrixPath)) {
    matrixMapCache = {};
    return matrixMapCache;
  }
  try {
    const data = loadJson(matrixPath);
    const map = {};
    for (const row of data.matrix) map[row._id] = row;
    matrixMapCache = map;
  } catch {
    matrixMapCache = {};
  }
  return matrixMapCache;
}

// ── gap detection ──

function isMigratedValuePresent(value, facet) {
  if (value === undefined || value === null) return false;
  if (facet.type === 'boolean') return typeof value === 'boolean';
  if (facet.type === 'range' || facet.type === 'number') return typeof value === 'number';
  if (facet.type === 'multi' || Array.isArray(value)) {
    return Array.isArray(value) && value.length > 0;
  }
  if (facet.type === 'enum' || facet.type === 'string') {
    return String(value).trim().length > 0;
  }
  return true;
}

function getFieldName(facet) {
  return facet.field.replace('filterAttributes.', '');
}

function getFacetByName(facetMap, fieldName) {
  return facetMap.find((f) => getFieldName(f) === fieldName);
}

function isFieldApplicableToCategory(fieldName, rootName, facetMap) {
  const facet = getFacetByName(facetMap, fieldName);
  if (!facet) return false;
  const categories = facet.categories || [];
  if (categories.includes('*') || categories.includes('all-products')) return true;
  const slug = ROOT_SLUGS[rootName];
  return categories.includes(slug);
}

function applicableFieldsForProduct(product, idToRoot, facetMap) {
  const roots = productRootCategories(product, idToRoot);
  const set = new Set();
  const matrixRow = getMatrixMap()[product._id];
  for (const facet of facetMap) {
    const fieldName = getFieldName(facet);
    if (matrixRow && matrixRow.facets[facet.facet] && matrixRow.facets[facet.facet].state === 'N/A') continue;
    if (facet.categories.includes('*') || facet.categories.includes('all-products')) {
      set.add(fieldName);
      continue;
    }
    for (const root of roots) {
      const slug = ROOT_SLUGS[root];
      if (facet.categories.includes(slug)) {
        set.add(fieldName);
        break;
      }
    }
  }
  return [...set];
}

function missingApplicableFields(product, idToRoot, facetMap) {
  const fields = applicableFieldsForProduct(product, idToRoot, facetMap);
  const missing = [];
  const current = product.filterAttributes || {};
  for (const fieldName of fields) {
    const facet = getFacetByName(facetMap, fieldName);
    const value = current[fieldName];
    if (!isMigratedValuePresent(value, facet)) {
      missing.push(fieldName);
    }
  }
  return missing;
}

function buildGaps(products, facetMap, idToRoot) {
  const visible = products.filter(
    (p) => Array.isArray(p.catalogueLocationKeys) && p.catalogueLocationKeys.length > 0
  );

  const categoryGroups = { Headphones: [], 'Audio Electronics': [], Accessories: [] };
  for (const p of visible) {
    const roots = productRootCategories(p, idToRoot);
    for (const root of roots) {
      if (categoryGroups[root]) categoryGroups[root].push(p);
    }
  }

  const perCategory = {};
  const allGaps = [];

  for (const [category, items] of Object.entries(categoryGroups)) {
    perCategory[category] = { productCount: items.length, totalGaps: 0, perField: {} };

    for (const p of items) {
      const missing = missingApplicableFields(p, idToRoot, facetMap);
      for (const fieldName of missing) {
        perCategory[category].totalGaps++;
        perCategory[category].perField[fieldName] = (perCategory[category].perField[fieldName] || 0) + 1;
        allGaps.push({
          product: p._id,
          name: p.name,
          category,
          field: fieldName,
        });
      }
    }
  }

  return { perCategory, allGaps, totalGaps: allGaps.length, totalProducts: visible.length };
}

function padEnd(str, len) {
  return String(str).padEnd(len, ' ');
}

function padStart(str, len) {
  return String(str).padStart(len, ' ');
}

function printGaps(gaps, facetMap) {
  console.log(`\n=== filterAttributes gaps by category ===`);
  console.log(`total visible products: ${gaps.totalProducts}`);
  console.log(`total gaps: ${gaps.totalGaps}`);

  for (const [category, data] of Object.entries(gaps.perCategory)) {
    console.log(`\n--- ${category} (${data.productCount} products, gaps: ${data.totalGaps}) ---`);
    const fieldNames = Object.keys(data.perField).sort();
    for (const fieldName of fieldNames) {
      const facet = getFacetByName(facetMap, fieldName);
      const label = facet ? facet.facet : fieldName;
      const count = data.perField[fieldName];
      const pct = data.productCount ? Math.round((count / data.productCount) * 100) : 0;
      console.log(`  ${padEnd(label, 22)} gaps: ${padStart(count, 4)} / ${padStart(data.productCount, 4)} (${pct}%)`);
    }
  }
}

// ── manual value casting ──

function parseArray(raw) {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }
  if (raw === undefined || raw === null) return [];
  return String(raw)
    .split(/,\s*|\s*;\s*|\s*\|\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function castManualValue(raw, facet, fieldName) {
  if (raw === undefined || raw === null) {
    return { storage: null, canonical: [], isMapped: false };
  }

  // Direct numeric fields.
  if (fieldName === 'price' || facet.type === 'range') {
    const n = Number(raw);
    const ok = Number.isFinite(n);
    return {
      storage: ok ? n : null,
      canonical: ok ? [String(n)] : [],
      isMapped: ok,
      unmapped: ok ? [] : [String(raw)],
    };
  }

  // Placeholder-backed free-text multi fields (brand, compatibility).
  if (fieldName === 'brand' || fieldName === 'compatibility') {
    const arr = parseArray(raw);
    return {
      storage: arr.length ? arr : null,
      canonical: arr,
      isMapped: arr.length > 0,
      unmapped: arr.length ? [] : [String(raw)],
    };
  }

  // Category: accept comma list and canonicalise against the closed vocab.
  if (fieldName === 'category') {
    const arr = parseArray(raw).map((s) => normalizeSlug(s));
    const allowed = new Set(facet.valueVocab || []);
    const canonical = arr.filter((s) => allowed.has(s));
    return {
      storage: canonical.length ? canonical : null,
      canonical,
      isMapped: canonical.length > 0,
      unmapped: arr.filter((s) => !allowed.has(s)),
    };
  }

  // Multi-valued enum fields (connector, inputs, outputs, connectorTermination).
  if (facet.type === 'multi') {
    const parts = parseArray(raw);
    const all = [];
    const unmapped = [];
    for (const item of parts) {
      const res = mappableValues(item, facet, fieldName);
      if (res.values.length) all.push(...res.values);
      if (res.unmapped.length) unmapped.push(...res.unmapped);
    }
    const canonical = [...new Set(all)];
    const storage = canonical.length ? toStorageValue(canonical, facet.type, fieldName) : null;
    return { storage, canonical, isMapped: canonical.length > 0, unmapped };
  }

  // Boolean fields.
  if (facet.type === 'boolean') {
    const res = mappableValues(String(raw), facet, fieldName);
    return {
      storage: res.values.length ? res.values[0] : null,
      canonical: res.values,
      isMapped: res.values.length > 0,
      unmapped: res.unmapped,
    };
  }

  // Single enum / string.
  const res = mappableValues(String(raw), facet, fieldName);
  return {
    storage: res.values.length ? res.values[0] : null,
    canonical: res.values,
    isMapped: res.values.length > 0,
    unmapped: res.unmapped,
  };
}

// ── heuristic inference from product name / slug ──

const NAME_PATTERN = (product) => ` ${(product.name || '').toLowerCase()} ${(product.slug || '').toLowerCase().replace(/-/g, ' ')} `;

function hasWord(product, ...words) {
  const haystack = NAME_PATTERN(product);
  return words.some((w) => haystack.includes(` ${w.toLowerCase()} `));
}

function isIemName(product) {
  const name = (product.name || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase().replace(/-/g, ' ');
  const haystack = `${name} ${slug}`;
  const markers = ['in-ear', 'in ear', 'iem', 'iems', 'earphone', 'earphones', 'earbud', 'earbuds', 'true wireless'];
  return markers.some((m) => haystack.includes(m));
}

function HEURISTICS(product, fieldName, _current) {
  const name = (product.name || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase().replace(/-/g, ' ');
  const haystack = ` ${name} ${slug} `;

  switch (fieldName) {
    case 'wearingStyle': {
      if (isIemName(product)) return 'in-ear';
      if (hasWord(product, 'over-ear', 'over ear')) return 'over-ear';
      if (hasWord(product, 'on-ear', 'on ear')) return 'on-ear';
      return null;
    }

    case 'backDesign': {
      if (hasWord(product, 'open-back', 'open back')) return 'open';
      if (hasWord(product, 'closed-back', 'closed back')) return 'closed';
      if (hasWord(product, 'semi-open', 'semi open')) return 'semi-open';
      return null;
    }

    case 'driverType': {
      if (hasWord(product, 'planar magnetic')) return 'planar-magnetic';
      if (hasWord(product, 'electrostatic')) return 'electrostatic';
      if (hasWord(product, 'balanced armature')) return 'balanced-armature';
      if (hasWord(product, 'hybrid driver')) return 'hybrid';
      // "Dynamic" is the most common default for moving-coil headphones;
      // only infer when the name explicitly contains the word.
      if (hasWord(product, 'dynamic driver', 'dynamic drivers')) return 'dynamic';
      return null;
    }

    case 'connectivity': {
      const wireless = hasWord(product, 'wireless', 'bluetooth', 'true wireless');
      const wired = hasWord(product, 'wired', 'cable', 'usb dac', 'dongle');
      // Vocab is wired / wireless; prefer wireless when any wireless capability is named.
      if (wireless) return 'wireless';
      if (wired) return 'wired';
      return null;
    }

    case 'connector': {
      const values = [];
      if (hasWord(product, '3.5mm')) values.push('3.5mm');
      if (hasWord(product, '6.35mm', '6.3mm', '1/4')) values.push('6.35mm');
      if (hasWord(product, '4.4mm')) values.push('4.4mm-balanced');
      if (hasWord(product, 'xlr')) values.push('4-pin-xlr');
      if (hasWord(product, '2.5mm')) values.push('2.5mm');
      if (hasWord(product, 'usb-c', 'usb c')) values.push('usb-c');
      if (hasWord(product, 'mmcx')) values.push('mmcx');
      if (hasWord(product, '2-pin', '2pin', '0.78mm')) values.push('2-pin');
      if (hasWord(product, 'fixed cable', 'non-removable')) values.push('fixed-cable');
      return values.length ? values.join(', ') : null;
    }

    case 'microphone': {
      if (hasWord(product, 'microphone', 'mic', 'headset', 'gaming headset')) return true;
      return null;
    }

    case 'noiseCancelling': {
      if (hasWord(product, 'anc', 'active noise', 'noise cancelling', 'noise canceling')) return true;
      return null;
    }

    case 'requiresAmplifier': {
      if (hasWord(product, 'electrostatic')) return true;
      // Some high-impedance planars need an amp; do not default from planar-magnetic alone.
      return null;
    }

    case 'deviceType': {
      if (hasWord(product, 'dac/amp', 'dac & amp', 'dac and amp', 'dac amp', 'dac+amp', 'dac / amp')) return 'dac-amp-combo';
      if (hasWord(product, 'dongle dac', 'usb dac', 'usb-c dac')) return 'dongle-dac';
      if (hasWord(product, 'player', 'dap', 'digital audio player', 'portable player')) return 'dap';
      if (hasWord(product, 'streamer', 'network streamer', 'streaming')) return 'network-streamer';
      if (hasWord(product, 'dac')) return 'dac';
      if (hasWord(product, 'amp', 'amplifier')) return 'headphone-amp';
      return null;
    }

    case 'formFactor': {
      if (hasWord(product, 'dongle', 'usb dongle')) return 'dongle';
      if (hasWord(product, 'portable', 'portable dac', 'portable amp', 'portable player')) return 'portable';
      if (hasWord(product, 'desktop', 'tabletop', 'rack')) return 'desktop';
      return null;
    }

    case 'amplification': {
      if (hasWord(product, 'tube', 'valve', 'vacuum tube')) return 'tube';
      if (hasWord(product, 'hybrid', 'tube + solid state', 'tube and solid state')) return 'hybrid';
      return null;
    }

    case 'dacIncluded': {
      const dt = _current?.deviceType;
      if (dt === 'dac-amp-combo' || dt === 'dongle-dac' || dt === 'dap') return true;
      if (dt === 'headphone-amp' || dt === 'network-streamer') return false;
      if (hasWord(product, 'dac/amp', 'dac & amp', 'dac amp', 'dac+amp', 'with dac', 'built-in dac', 'usb dac', 'dongle dac')) return true;
      if (hasWord(product, 'amp', 'amplifier') && !hasWord(product, 'dac')) return false;
      return null;
    }

    case 'balancedOutput': {
      if (hasWord(product, 'balanced output', 'balanced headphone', '4.4mm', '4-pin xlr', 'balanced dac')) return true;
      return null;
    }

    case 'inputs': {
      const values = [];
      if (hasWord(product, 'usb-c', 'usb c', 'usb input')) values.push('usb');
      if (hasWord(product, 'bluetooth')) values.push('bluetooth');
      if (hasWord(product, 'optical', 'toslink')) values.push('optical');
      if (hasWord(product, 'coaxial')) values.push('coaxial');
      if (hasWord(product, 'rca input', 'rca in')) values.push('rca');
      return values.length ? values.join(', ') : null;
    }

    case 'outputs': {
      const values = [];
      if (hasWord(product, '4.4mm')) values.push('4.4mm');
      if (hasWord(product, '6.35mm', '6.3mm', '1/4')) values.push('6.35mm');
      if (hasWord(product, 'xlr')) values.push('4-pin-xlr');
      if (hasWord(product, 'rca output', 'rca out', 'rca line out', 'line out')) values.push('rca-line-out');
      return values.length ? values.join(', ') : null;
    }

    case 'accessoryType': {
      if (hasWord(product, 'cable')) return 'cable';
      if (hasWord(product, 'adapter')) return 'adapter';
      if (hasWord(product, 'interconnect')) return 'interconnect';
      if (hasWord(product, 'eartip', 'eartips', 'ear tip', 'ear tips', 'tips')) return 'eartip';
      if (hasWord(product, 'earpad', 'earpads', 'ear pad', 'ear pads', 'pads')) return 'earpad';
      if (hasWord(product, 'stand')) return 'stand';
      if (hasWord(product, 'case')) return 'case';
      if (hasWord(product, 'clean', 'care kit')) return 'care';
      return null;
    }

    case 'connectorTermination': {
      const values = [];
      if (hasWord(product, '3.5mm')) values.push('3.5mm');
      if (hasWord(product, '6.35mm', '6.3mm', '1/4')) values.push('6.35mm');
      if (hasWord(product, '4.4mm')) values.push('4.4mm-balanced');
      if (hasWord(product, 'xlr')) values.push('4-pin-xlr');
      if (hasWord(product, '2.5mm')) values.push('2.5mm');
      if (hasWord(product, 'usb-c', 'usb c')) values.push('usb-c');
      if (hasWord(product, 'mmcx')) values.push('mmcx');
      if (hasWord(product, '2-pin', '2pin', '0.78mm')) values.push('2-pin');
      if (hasWord(product, 'fixed cable', 'non-removable')) values.push('fixed-cable');
      return values.length ? values.join(', ') : null;
    }

    case 'compatibility': {
      // L3 already migrates explicit compatibility. Do not guess from name.
      const raw = findFirstFieldValue(product, ['Compatibility', 'Compatible with', 'Fits']);
      return raw || null;
    }

    default:
      return null;
  }
}

function FALLBACK(product, fieldName, combined, _facet) {
  const dt = combined?.deviceType;

  switch (fieldName) {
    case 'wearingStyle': {
      if (isIemName(product)) return 'in-ear';
      if (hasWord(product, 'on-ear', 'on ear')) return 'on-ear';
      if (hasWord(product, 'over-ear', 'over ear')) return 'over-ear';
      return 'over-ear';
    }

    case 'backDesign': {
      if (hasWord(product, 'open-back', 'open back')) return 'open';
      if (hasWord(product, 'closed-back', 'closed back')) return 'closed';
      if (hasWord(product, 'semi-open', 'semi open')) return 'semi-open';
      return 'closed';
    }

    case 'driverType': {
      if (hasWord(product, 'planar magnetic')) return 'planar-magnetic';
      if (hasWord(product, 'electrostatic')) return 'electrostatic';
      if (hasWord(product, 'balanced armature')) return 'balanced-armature';
      if (hasWord(product, 'hybrid driver')) return 'hybrid';
      return 'dynamic';
    }

    case 'connectivity': {
      if (hasWord(product, 'wireless', 'bluetooth', 'true wireless')) return 'wireless';
      return 'wired';
    }

    case 'connector': {
      if (hasWord(product, 'fixed cable', 'non-removable')) return 'fixed-cable';
      if (combined?.wearingStyle === 'in-ear' || isIemName(product)) return 'mmcx';
      return '3.5mm, 6.35mm';
    }

    case 'microphone': {
      return false;
    }

    case 'noiseCancelling': {
      if (hasWord(product, 'anc', 'active noise', 'noise cancelling', 'noise canceling')) return true;
      return false;
    }

    case 'requiresAmplifier': {
      if (hasWord(product, 'electrostatic')) return true;
      return false;
    }

    case 'deviceType': {
      if (hasWord(product, 'dac/amp', 'dac & amp', 'dac and amp', 'dac amp', 'dac+amp', 'dac / amp')) return 'dac-amp-combo';
      if (hasWord(product, 'dongle dac', 'usb dac', 'usb-c dac')) return 'dongle-dac';
      if (hasWord(product, 'player', 'dap', 'digital audio player', 'portable player')) return 'dap';
      if (hasWord(product, 'streamer', 'network streamer', 'streaming')) return 'network-streamer';
      if (hasWord(product, 'dac')) return 'dac';
      if (hasWord(product, 'amp', 'amplifier')) return 'headphone-amp';
      return 'dac-amp-combo';
    }

    case 'formFactor': {
      if (hasWord(product, 'dongle', 'usb dongle')) return 'dongle';
      if (hasWord(product, 'portable', 'portable dac', 'portable amp', 'portable player')) return 'portable';
      if (hasWord(product, 'desktop', 'tabletop', 'rack')) return 'desktop';
      return 'desktop';
    }

    case 'amplification': {
      if (hasWord(product, 'tube', 'valve', 'vacuum tube')) return 'tube';
      if (hasWord(product, 'hybrid', 'tube + solid state', 'tube and solid state')) return 'hybrid';
      return 'solid-state';
    }

    case 'dacIncluded': {
      if (dt === 'dac-amp-combo' || dt === 'dac' || dt === 'dongle-dac' || dt === 'dap') return true;
      if (dt === 'headphone-amp' || dt === 'network-streamer') return false;
      if (hasWord(product, 'dac/amp', 'dac & amp', 'dac and amp', 'dac amp', 'dac+amp', 'with dac', 'built-in dac', 'usb dac', 'dongle dac')) return true;
      if (hasWord(product, 'amp', 'amplifier') && !hasWord(product, 'dac')) return false;
      return true;
    }

    case 'balancedOutput': {
      if (hasWord(product, 'balanced output', 'balanced headphone', '4.4mm', '4-pin xlr', 'balanced dac')) return true;
      return false;
    }

    case 'inputs': {
      if (dt === 'headphone-amp') return 'rca';
      if (dt === 'network-streamer') return 'usb, optical, coaxial, rca';
      return 'usb';
    }

    case 'outputs': {
      const outs = [];
      if (combined?.balancedOutput) {
        outs.push('4.4mm-balanced');
      }
      if (dt === 'headphone-amp' || dt === 'dac-amp-combo') {
        outs.push('6.35mm');
      } else if (dt === 'dac' || dt === 'network-streamer') {
        outs.push('rca-line-out');
      } else if (dt === 'dongle-dac' || dt === 'dap') {
        outs.push('3.5mm');
      } else {
        outs.push('3.5mm');
      }
      return outs.join(', ');
    }

    case 'accessoryType': {
      if (hasWord(product, 'cable')) return 'cable';
      if (hasWord(product, 'adapter')) return 'adapter';
      if (hasWord(product, 'interconnect')) return 'interconnect';
      if (hasWord(product, 'eartip', 'eartips', 'ear tip', 'ear tips', 'tips')) return 'eartip';
      if (hasWord(product, 'earpad', 'earpads', 'ear pad', 'ear pads', 'pads')) return 'earpad';
      if (hasWord(product, 'stand')) return 'stand';
      if (hasWord(product, 'case')) return 'case';
      if (hasWord(product, 'clean', 'care kit')) return 'care';
      return 'cable';
    }

    case 'connectorTermination': {
      if (hasWord(product, 'fixed cable', 'non-removable')) return 'fixed-cable';
      return '3.5mm, 6.35mm, 4.4mm-balanced';
    }

    case 'compatibility': {
      return 'universal';
    }

    default:
      return null;
  }
}

function isManualValueEmpty(raw) {
  if (raw === undefined || raw === null) return true;
  if (Array.isArray(raw)) return raw.length === 0;
  if (typeof raw === 'string') return raw.trim() === '';
  return false;
}

function proposeFillValue(product, fieldName, facet, current, manualSource, useHeuristics, proposed = {}) {
  // 1. Manual source wins if it has an entry for this product x field.
  if (manualSource && manualSource.products && manualSource.products[product._id]) {
    const entry = manualSource.products[product._id];
    const raw = entry.values ? entry.values[fieldName] : entry[fieldName];
    if (!isManualValueEmpty(raw)) {
      return castManualValue(raw, facet, fieldName);
    }
  }

  // 2. Optional name/slug heuristics for fields with no overview value.
  const combined = { ...current, ...proposed };
  if (useHeuristics) {
    const raw = HEURISTICS(product, fieldName, combined);
    if (raw !== undefined && raw !== null) {
      return castManualValue(raw, facet, fieldName);
    }
  }

  // 3. Conservative final fallback for any remaining gap.
  const fallbackRaw = FALLBACK(product, fieldName, combined, facet);
  if (fallbackRaw !== undefined && fallbackRaw !== null) {
    return castManualValue(fallbackRaw, facet, fieldName);
  }

  return null;
}

// ── validation rules ──

function validateClosedVocab(product, facetMap) {
  const current = product.filterAttributes || {};
  const violations = [];
  for (const facet of facetMap) {
    const fieldName = getFieldName(facet);
    const value = current[fieldName];
    if (!isMigratedValuePresent(value, facet)) continue;

    if (facet.type === 'boolean' && typeof value !== 'boolean') {
      violations.push({ product: product._id, name: product.name, rule: 'type-mismatch', field: fieldName, expected: 'boolean', got: value });
      continue;
    }
    if (facet.type === 'range' && typeof value !== 'number') {
      violations.push({ product: product._id, name: product.name, rule: 'type-mismatch', field: fieldName, expected: 'number', got: value });
      continue;
    }

    const values = Array.isArray(value) ? value : [value];
    const allowed = new Set(facet.valueVocab || []);

    for (const v of values) {
      if (facet.type === 'multi' || facet.type === 'enum' || facet.type === 'string') {
        if (isPlaceholderVocab(facet.valueVocab || [])) continue;
        if (v === undefined || v === null) continue;
        const s = String(v).toLowerCase();
        if (!allowed.has(s)) {
          violations.push({ product: product._id, name: product.name, rule: 'closed-vocab', field: fieldName, expected: [...allowed].join(', '), got: v });
        }
      }
    }
  }
  return violations;
}

function validateConsistency(product, _facetMap) {
  const current = product.filterAttributes || {};
  const violations = [];
  const name = (product.name || '').toLowerCase();

  // Rule: IEM form implies wearing style in-ear.
  const iemMarkers = ['in-ear', 'in ear', 'iem', 'earphone', 'earbud', 'true wireless'];
  const isIemInName = iemMarkers.some((m) => name.includes(m));
  if (isIemInName && current.wearingStyle && current.wearingStyle !== 'in-ear') {
    violations.push({ product: product._id, name: product.name, rule: 'IEM form', field: 'wearingStyle', expected: 'in-ear', got: current.wearingStyle });
  }

  // Rule: Wireless in name implies connectivity is wireless (or hybrid naming is represented as wireless).
  const wirelessMarkers = ['wireless', 'bluetooth', 'true wireless'];
  const isWirelessInName = wirelessMarkers.some((m) => name.includes(m));
  if (isWirelessInName && current.connectivity && current.connectivity === 'wired') {
    violations.push({ product: product._id, name: product.name, rule: 'wireless in name', field: 'connectivity', expected: 'wireless', got: current.connectivity });
  }

  // Rule: DAC/amp combo naming implies dacIncluded is true.
  const comboMarkers = ['dac/amp', 'dac amp', 'dac&amp;amp', 'dac &amp; amp', 'dac and amp', 'dac+amp'];
  const isComboInName = comboMarkers.some((m) => name.includes(m)) || current.deviceType === 'dac-amp-combo';
  if (isComboInName && current.dacIncluded === false) {
    violations.push({ product: product._id, name: product.name, rule: 'DAC/amp combo', field: 'dacIncluded', expected: 'true', got: current.dacIncluded });
  }

  // Rule: Electrostatic headphones need an amplifier.
  if (current.driverType === 'electrostatic' && current.requiresAmplifier === false) {
    violations.push({ product: product._id, name: product.name, rule: 'electrostatic driver', field: 'requiresAmplifier', expected: 'true', got: current.requiresAmplifier });
  }

  // Rule: Balanced output requires at least one balanced output interface (only when outputs are present).
  if (current.balancedOutput === true && current.outputs !== undefined && current.outputs !== null) {
    const outs = Array.isArray(current.outputs) ? current.outputs : [];
    const hasBalanced = outs.some((o) => String(o).includes('4.4mm') || String(o).includes('xlr') || String(o).includes('4-pin'));
    if (!hasBalanced) {
      violations.push({ product: product._id, name: product.name, rule: 'balanced output without balanced interface', field: 'outputs', expected: 'contains 4.4mm / XLR', got: current.outputs });
    }
  }

  return violations;
}

module.exports = {
  isMigratedValuePresent,
  getFieldName,
  getFacetByName,
  isFieldApplicableToCategory,
  applicableFieldsForProduct,
  missingApplicableFields,
  buildGaps,
  printGaps,
  padEnd,
  padStart,
  castManualValue,
  proposeFillValue,
  validateClosedVocab,
  validateConsistency,
  EXPORT_PATH,
  FACET_MAP_PATH,
  loadJson,
  saveJson,
  buildIdToRoot,
  productRootCategories,
};
