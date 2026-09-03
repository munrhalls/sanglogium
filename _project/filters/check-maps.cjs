const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const FACET_MAP_PATH = path.join(BASE_DIR, 'facet-map.json');
const SORT_MAP_PATH = path.join(BASE_DIR, 'sort-map.json');
const DRAFT_HTML_PATH = path.join(BASE_DIR, '..', 'scratch', 'filter-map.html');

const FACET_TYPES = new Set(['range', 'enum', 'boolean', 'multi']);
const SORT_BACKING_FIELDS = new Set([
  'sortAttributes.featuredPriority',
  'sortAttributes.popularity',
  'price_data.unit_amount',
  '_createdAt',
]);
const SORT_DIRECTIONS = new Set(['asc', 'desc']);

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadHtml(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function cleanHtmlText(raw) {
  return raw
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s*·\s*default/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDraftSorts(html) {
  const match = html.match(/<div class="sorts">([\s\S]*?)<\/div>/);
  if (!match) return [];
  const section = match[1];
  const chips = [];
  const re = /<span class="chip">([^<]+)<\/span>/g;
  let m;
  while ((m = re.exec(section)) !== null) {
    const text = cleanHtmlText(m[1]);
    if (text) chips.push(text);
  }
  return chips;
}

function extractDraftFacets(html) {
  const match = html.match(/<div class="grid">([\s\S]*?)<\/div>\s*<div class="tier2"/);
  if (!match) return [];
  const section = match[1];
  const names = [];
  const re = /<div class="fname">([^<]+)<\/div>/g;
  let m;
  while ((m = re.exec(section)) !== null) {
    const text = cleanHtmlText(m[1]);
    if (text && text !== 'Universal set') names.push(text);
  }
  return names;
}

function reportError(message) {
  console.error(`  ✖ ${message}`);
}

function validateFacets(facets) {
  const errors = [];
  const seenFields = new Map();
  const seenUrlParams = new Map();

  facets.forEach((facet, index) => {
    const id = facet.facet ?? `#${index}`;

    const required = ['facet', 'field', 'type', 'valueVocab', 'categories', 'urlParam'];
    for (const key of required) {
      if (facet[key] === undefined || facet[key] === null || facet[key] === '') {
        errors.push(`facet ${id}: missing or empty "${key}"`);
      }
    }

    if (facet.field !== undefined) {
      if (!facet.field.startsWith('filterAttributes.')) {
        errors.push(`facet ${id}: field "${facet.field}" must start with "filterAttributes."`);
      }
      seenFields.set(facet.field, (seenFields.get(facet.field) || 0) + 1);
    }

    if (facet.urlParam !== undefined) {
      seenUrlParams.set(facet.urlParam, (seenUrlParams.get(facet.urlParam) || 0) + 1);
    }

    if (facet.type !== undefined && !FACET_TYPES.has(facet.type)) {
      errors.push(`facet ${id}: unknown type "${facet.type}"`);
    }

    if (facet.valueVocab !== undefined && !Array.isArray(facet.valueVocab)) {
      errors.push(`facet ${id}: valueVocab must be an array`);
    }

    if (facet.categories !== undefined && !Array.isArray(facet.categories)) {
      errors.push(`facet ${id}: categories must be an array`);
    }
  });

  for (const [field, count] of seenFields) {
    if (count > 1) errors.push(`duplicate facet field "${field}" appears ${count} times`);
  }
  for (const [urlParam, count] of seenUrlParams) {
    if (count > 1) errors.push(`duplicate facet urlParam "${urlParam}" appears ${count} times`);
  }

  const incompleteCount = errors.filter((e) => e.includes('missing or empty')).length;
  const duplicateFieldCount = [...seenFields.values()].filter((c) => c > 1).length;

  return { errors, incompleteCount, duplicateFieldCount };
}

function validateSorts(sorts) {
  const errors = [];
  const seenUrlValues = new Map();

  sorts.forEach((sort, index) => {
    const id = sort.sort ?? `#${index}`;

    const required = ['sort', 'urlValue', 'backingField', 'direction', 'tieBreak'];
    for (const key of required) {
      if (sort[key] === undefined || sort[key] === null || sort[key] === '') {
        errors.push(`sort ${id}: missing or empty "${key}"`);
      }
    }

    if (sort.backingField !== undefined && !SORT_BACKING_FIELDS.has(sort.backingField)) {
      errors.push(`sort ${id}: backing field "${sort.backingField}" is not allowed`);
    }

    if (sort.direction !== undefined && !SORT_DIRECTIONS.has(sort.direction)) {
      errors.push(`sort ${id}: direction "${sort.direction}" must be "asc" or "desc"`);
    }

    if (sort.urlValue !== undefined) {
      seenUrlValues.set(sort.urlValue, (seenUrlValues.get(sort.urlValue) || 0) + 1);
    }
  });

  for (const [urlValue, count] of seenUrlValues) {
    if (count > 1) errors.push(`duplicate sort urlValue "${urlValue}" appears ${count} times`);
  }

  const incompleteCount = errors.filter((e) => e.includes('missing or empty')).length;

  return { errors, incompleteCount };
}

function checkCoverage(draftNames, mapNames, label) {
  const missing = draftNames.filter((name) => !mapNames.includes(name));
  if (missing.length === 0) {
    console.log(`coverage vs draft: complete — ${label}`);
    return true;
  }
  console.error(`coverage vs draft: incomplete — ${label} missing: ${missing.join(', ')}`);
  return false;
}

function printTable(data, columns) {
  const rows = data.map((item) => {
    const row = {};
    for (const col of columns) {
      row[col] = item[col];
    }
    return row;
  });
  console.table(rows);
}

function main() {
  const facets = loadJson(FACET_MAP_PATH);
  const sorts = loadJson(SORT_MAP_PATH);
  const draftHtml = loadHtml(DRAFT_HTML_PATH);

  console.log('=== Facets ===');
  printTable(facets, ['facet', 'field', 'type', 'categories', 'urlParam']);

  console.log('\n=== Sorts ===');
  printTable(sorts, ['sort', 'urlValue', 'backingField', 'direction', 'tieBreak']);

  const facetValidation = validateFacets(facets);
  const sortValidation = validateSorts(sorts);

  console.log('\n=== Validation ===');
  const allErrors = [
    ...facetValidation.errors,
    ...sortValidation.errors,
  ];

  if (allErrors.length > 0) {
    allErrors.forEach(reportError);
  } else {
    console.log('  ✓ all map entries are complete and field names are unique');
  }

  console.log('\n=== Coverage vs draft map ===');
  const draftFacets = extractDraftFacets(draftHtml);
  const draftSorts = extractDraftSorts(draftHtml);
  const facetNames = facets.map((f) => f.facet);
  const sortNames = sorts.map((s) => s.sort);

  const facetsComplete = checkCoverage(draftFacets, facetNames, 'facets');
  const sortsComplete = checkCoverage(draftSorts, sortNames, 'sorts');

  const duplicateFieldCount = facetValidation.duplicateFieldCount;
  const incompleteCount = facetValidation.incompleteCount + sortValidation.incompleteCount;

  console.log(`\n${facets.length} facets, ${sorts.length} sorts — ${incompleteCount} incomplete, ${duplicateFieldCount} duplicate field names`);

  if (allErrors.length > 0 || !facetsComplete || !sortsComplete) {
    process.exit(1);
  }
}

main();
