// Live scan of the product data behind the three catalogue slices
// (headphones, audio-electronics, accessories). For each slice it fetches
// the same products the storefront's facet computation sees, writes the
// raw product array to out/product-data.<slice>.json, and writes a
// per-field inventory (field types, carrier counts, distinct values) to
// out/product-data-inventory.md.
//
// Run: node --env-file=.env.local tests/product-filtering/scan-product-data.mjs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { sanityQuery } from './sanity-raw.mjs';

const SLICES = ['headphones', 'audio-electronics', 'accessories'];
const OUT_DIR = new URL('./out/', import.meta.url);
const catalogueIndex = JSON.parse(
  readFileSync(new URL('../../data/catalogue-index.json', import.meta.url), 'utf8'),
);

// Input: one category node id (e.g. the id for "headphones").
// Output: that id plus every descendant node's id, flattened into one array.
// This is the full id set a product's catalogueLocationKeys must overlap
// with to count as "a headphones product" for this scan.
function collectCategoryIdWithDescendants(categoryNodeId) {
  const slotMetadataMap = catalogueIndex.slotMetadataMap;
  if (!slotMetadataMap[categoryNodeId]) return [categoryNodeId];

  const collectedIds = new Set();
  const stack = [categoryNodeId];
  while (stack.length > 0) {
    const currentId = stack.pop();
    if (collectedIds.has(currentId)) continue;
    collectedIds.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }
  return Array.from(collectedIds);
}

const PRODUCT_QUERY = `*[_type == "product" && !(_id in path("drafts.**")) && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [0...1000] {
  _id, name, filterAttributes,
  "brandRef": brand->{ name, "slug": slug.current },
  "price": price_data.unit_amount,
  stock, reservedStock
}`;

// Inventory accumulation: attribute -> { kinds:Set, carriers:Set(productId),
// min, max, values:Map(value -> Set(productId)) }.
function newEntry() {
  return { kinds: new Set(), carriers: new Set(), min: Infinity, max: -Infinity, values: new Map() };
}

function recordValue(entry, productId, v) {
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (v < entry.min) entry.min = v;
    if (v > entry.max) entry.max = v;
  } else if (typeof v === 'string' || typeof v === 'boolean') {
    const s = String(v);
    if (!entry.values.has(s)) entry.values.set(s, new Set());
    entry.values.get(s).add(productId);
  }
  // anything else (objects, nested arrays) is ignored
}

function isSkippable(value) {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'number' && !Number.isFinite(value)) return true;
  return false;
}

function walkObject(obj, prefix, productId, attrs) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('_')) continue;
    const attribute = prefix ? `${prefix}.${key}` : key;
    if (isSkippable(value)) continue;

    const entry = attrs.get(attribute) || newEntry();
    attrs.set(attribute, entry);
    entry.carriers.add(productId);

    if (Array.isArray(value)) {
      entry.kinds.add('array');
      for (const el of value) {
        if (isSkippable(el)) continue;
        recordValue(entry, productId, el);
      }
    } else if (typeof value === 'object') {
      entry.kinds.add('object');
      walkObject(value, attribute, productId, attrs);
    } else {
      entry.kinds.add(typeof value);
      recordValue(entry, productId, value);
    }
  }
}

function buildInventory(products) {
  const attrs = new Map();
  for (const product of products) {
    if (!product.filterAttributes || typeof product.filterAttributes !== 'object') continue;
    walkObject(product.filterAttributes, '', product._id, attrs);
  }
  return attrs;
}

function esc(s) {
  return String(s).replaceAll('|', '\\|');
}

function valuesCell(entry) {
  const hasNumber = entry.kinds.has('number');
  if (entry.values.size === 0) {
    if (hasNumber) return `${entry.min}–${entry.max}`;
    if (entry.kinds.size === 1 && entry.kinds.has('object')) return '(object)';
    return hasNumber ? `${entry.min}–${entry.max}` : '';
  }
  const rows = [...entry.values.entries()]
    .map(([v, ids]) => ({ v, n: ids.size }))
    .sort((a, b) => b.n - a.n || String(a.v).localeCompare(String(b.v)));
  const shown = rows.slice(0, 40);
  let cell = shown.map((r) => `${esc(r.v)} ×${r.n}`).join(', ');
  if (hasNumber) cell += ` (range ${entry.min}–${entry.max})`;
  if (rows.length > 40) cell += `, … +${rows.length - 40} more`;
  return cell;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const sections = [];
  const summary = [];
  for (const slice of SLICES) {
    const id = catalogueIndex.slugToIdMap[slice];
    if (!id) throw new Error(`catalogue index has no id for slice "${slice}"`);
    const keys = collectCategoryIdWithDescendants(id);

    const products = await sanityQuery(PRODUCT_QUERY, { keys });
    if (products.length === 1000) {
      throw new Error(`slice "${slice}" hit the 1000-product cap`);
    }

    const dataFile = new URL(`./product-data.${slice}.json`, OUT_DIR);
    writeFileSync(dataFile, JSON.stringify(products, null, 2));

    const attrs = buildInventory(products);
    const lines = [
      `## ${slice} — ${products.length} products`,
      '',
      '| attribute | kinds | set on | values |',
      '| --- | --- | --- | --- |',
    ];
    for (const [attribute, entry] of [...attrs.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      const kinds = [...entry.kinds].sort().join(', ');
      lines.push(`| ${esc(attribute)} | ${kinds} | ${entry.carriers.size}/${products.length} | ${valuesCell(entry)} |`);
    }
    sections.push(lines.join('\n'));
    summary.push({ slice, products: products.length, attributes: attrs.size, dataFile });
  }

  const inventoryFile = new URL('./product-data-inventory.md', OUT_DIR);
  const doc = [
    `# Product data inventory (live scan ${new Date().toISOString()})`,
    '',
    sections.join('\n\n'),
    '',
  ].join('\n');
  writeFileSync(inventoryFile, doc);

  for (const s of summary) {
    console.log(`${s.slice}: ${s.products} products, ${s.attributes} attributes`);
    console.log(s.dataFile.href);
  }
  console.log(inventoryFile.href);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
