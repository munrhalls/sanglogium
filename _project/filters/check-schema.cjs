const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const PRODUCT_TYPE_PATH = path.join(BASE_DIR, '..', '..', 'sanity-cms', 'schemaTypes', 'productType.ts');
const FACET_MAP_PATH = path.join(BASE_DIR, 'facet-map.json');
const SORT_MAP_PATH = path.join(BASE_DIR, 'sort-map.json');

const EXPECTED_FILTER_PREFIX = 'filterAttributes.';
const EXPECTED_SORT_FIELDS = ['featuredPriority', 'popularity'];

// ── generic brace/bracket/paren matcher (handles " ' strings, not template literals) ──

function findMatching(text, openIdx) {
  const open = text[openIdx];
  const close = { '(': ')', '[': ']', '{': '}' }[open];
  if (!close) return -1;

  let depth = 1;
  let inString = false;
  let stringChar = null;
  let escape = false;

  for (let i = openIdx + 1; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) depth--;
    if (depth === 0) return i;
  }
  return -1;
}

function splitTopLevel(text, sep) {
  const parts = [];
  let depth = 0;
  let inString = false;
  let stringChar = null;
  let escape = false;
  let buf = '';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === stringChar) {
        inString = false;
      }
      buf += ch;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
    }
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') depth--;

    if (ch === sep && depth === 0) {
      parts.push(buf.trim());
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function parseStringLiteral(raw) {
  const quote = raw[0];
  let out = '';
  let escape = false;
  for (let i = 1; i < raw.length - 1; i++) {
    const ch = raw[i];
    if (escape) {
      out += ch;
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    out += ch;
  }
  return out;
}

function parseValue(raw) {
  const s = raw.trim();
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null') return null;
  if (s === 'undefined') return undefined;
  if (s.startsWith('"') || s.startsWith("'")) {
    return parseStringLiteral(s);
  }
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1);
    return splitTopLevel(inner, ',')
      .filter(Boolean)
      .map(parseValue);
  }
  if (s.startsWith('{') && s.endsWith('}')) {
    return parseObject(s);
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

function parseObject(objText) {
  const inner = objText.slice(1, -1).trim();
  const props = {};
  const properties = splitTopLevel(inner, ',');
  for (const prop of properties) {
    const colonIdx = prop.indexOf(':');
    if (colonIdx === -1) continue;
    const key = prop.slice(0, colonIdx).trim();
    const value = prop.slice(colonIdx + 1).trim();
    props[key] = parseValue(value);
  }
  return props;
}

// ── extract fields arrays from productType.ts ──

function findObjectArray(text, objectName) {
  const marker = `name: "${objectName}"`;
  const objIdx = text.indexOf(marker);
  if (objIdx === -1) throw new Error(`Could not find ${objectName} field`);

  const fieldsPattern = 'fields: ([';
  const fieldsIdx = text.indexOf(fieldsPattern, objIdx);
  if (fieldsIdx === -1) throw new Error(`Could not find fields array for ${objectName}`);

  const arrOpen = fieldsIdx + fieldsPattern.length - 1; // index of '['
  const arrClose = findMatching(text, arrOpen);
  if (arrClose === -1) throw new Error(`Unterminated fields array for ${objectName}`);

  const arrInner = text.slice(arrOpen + 1, arrClose);
  const rawItems = splitTopLevel(arrInner, ',').filter(Boolean);
  return rawItems.map(parseObject);
}

// ── schema analysis helpers ──

function getAllowedValues(field) {
  if (field.type === 'boolean') return ['true', 'false'];
  if (field.type === 'number') return ['range'];
  if (field.type === 'string' && Array.isArray(field.options?.list)) {
    return field.options.list;
  }
  if (field.type === 'array' && Array.isArray(field.of) && field.of[0]) {
    const member = field.of[0];
    if (member && member.type === 'string' && Array.isArray(member.options?.list)) {
      return member.options.list;
    }
  }
  return null;
}

function isClosedField(field) {
  if (field.type === 'boolean' || field.type === 'number') return true;
  if (field.type === 'string' && Array.isArray(field.options?.list) && field.options.list.length > 0) {
    return true;
  }
  if (field.type === 'array' && Array.isArray(field.of) && field.of[0]) {
    const member = field.of[0];
    if (member && member.type === 'string' && Array.isArray(member.options?.list) && member.options.list.length > 0) {
      return true;
    }
  }
  return false;
}

function schemaTypeMatchesFacetType(schemaField, facet) {
  switch (facet.type) {
    case 'range':
      return schemaField.type === 'number';
    case 'enum':
      return schemaField.type === 'string' && Array.isArray(schemaField.options?.list);
    case 'boolean':
      return schemaField.type === 'boolean';
    case 'multi':
      return (
        schemaField.type === 'array' &&
        Array.isArray(schemaField.of) &&
        schemaField.of[0]?.type === 'string' &&
        Array.isArray(schemaField.of[0]?.options?.list)
      );
    default:
      return false;
  }
}

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// ── main check logic ──

function main() {
  const text = fs.readFileSync(PRODUCT_TYPE_PATH, 'utf8');
  const facetMap = JSON.parse(fs.readFileSync(FACET_MAP_PATH, 'utf8'));
  const sortMap = JSON.parse(fs.readFileSync(SORT_MAP_PATH, 'utf8'));

  const filterFields = findObjectArray(text, 'filterAttributes');
  const sortFields = findObjectArray(text, 'sortAttributes');

  console.log('=== filterAttributes fields ===');
  for (const field of filterFields) {
    const allowed = getAllowedValues(field);
    const allowedText = allowed ? allowed.join(', ') : 'n/a';
    console.log(`  ${field.name} (${field.type}) — allowed: ${allowedText}`);
  }

  console.log('\n=== sortAttributes fields ===');
  for (const field of sortFields) {
    console.log(`  ${field.name} (${field.type})`);
  }

  const missingFields = [];
  const extraFields = [];
  const drift = [];
  const freeStringFields = [];
  const filterByName = new Map(filterFields.map((f) => [f.name, f]));

  // Bijective: facet map -> schema
  for (const facet of facetMap) {
    const fieldName = facet.field.replace(EXPECTED_FILTER_PREFIX, '');
    const schemaField = filterByName.get(fieldName);
    if (!schemaField) {
      missingFields.push(`facet "${facet.facet}" maps to missing field "${fieldName}"`);
      continue;
    }
    if (!schemaTypeMatchesFacetType(schemaField, facet)) {
      drift.push(`facet "${facet.facet}" (${facet.type}) does not match schema type for "${fieldName}" (${schemaField.type})`);
    } else if (facet.type !== 'range') {
      const schemaList = getAllowedValues(schemaField);
      if (schemaList && !arraysEqual(schemaList, facet.valueVocab)) {
        drift.push(`facet "${facet.facet}" valueVocab mismatch: map=[${facet.valueVocab.join(', ')}], schema=[${schemaList.join(', ')}]`);
      }
    }
    if (!isClosedField(schemaField)) {
      freeStringFields.push(fieldName);
    }
  }

  // Bijective: schema -> facet map
  const facetNames = new Set(facetMap.map((f) => f.field.replace(EXPECTED_FILTER_PREFIX, '')));
  for (const schemaField of filterFields) {
    if (!facetNames.has(schemaField.name)) {
      extraFields.push(`schema field "${schemaField.name}" has no matching facet in facet-map.json`);
      if (!isClosedField(schemaField)) {
        freeStringFields.push(schemaField.name);
      }
    }
  }

  // sortAttributes: exactly featuredPriority + popularity, both number
  const sortByName = new Map(sortFields.map((f) => [f.name, f]));
  for (const expected of EXPECTED_SORT_FIELDS) {
    const field = sortByName.get(expected);
    if (!field) {
      drift.push(`sortAttributes missing "${expected}"`);
    } else if (field.type !== 'number') {
      drift.push(`sortAttributes "${expected}" should be number, got ${field.type}`);
    }
  }
  for (const field of sortFields) {
    if (!EXPECTED_SORT_FIELDS.includes(field.name)) {
      drift.push(`sortAttributes contains extra field "${field.name}"`);
    }
  }

  // sort-map backing fields that start with sortAttributes. must be present
  const sortMapSortFields = sortMap
    .map((s) => s.backingField)
    .filter((f) => f.startsWith('sortAttributes.'))
    .map((f) => f.replace('sortAttributes.', ''));
  for (const f of sortMapSortFields) {
    if (!sortByName.has(f)) {
      drift.push(`sort-map references "sortAttributes.${f}" but it is missing`);
    }
  }

  const allDrift = [...missingFields, ...extraFields, ...drift];

  console.log('\n=== Validation ===');
  console.log(`free-string attribute fields: ${freeStringFields.length}`);
  if (freeStringFields.length > 0) {
    console.log(`  ✖ ${freeStringFields.join(', ')}`);
  }

  const bijective = missingFields.length === 0 && extraFields.length === 0;
  console.log(`bijective: ${bijective ? 'yes' : 'no'}`);
  if (missingFields.length > 0 || extraFields.length > 0) {
    for (const d of missingFields) console.log(`  ✖ ${d}`);
    for (const d of extraFields) console.log(`  ✖ ${d}`);
  }

  if (drift.length > 0) {
    for (const d of drift) console.log(`  ✖ ${d}`);
  }

  console.log(`\ndrift vs facet-map.json / sort-map.json: ${allDrift.length}`);

  if (allDrift.length > 0 || freeStringFields.length > 0) {
    process.exit(1);
  }
}

main();
