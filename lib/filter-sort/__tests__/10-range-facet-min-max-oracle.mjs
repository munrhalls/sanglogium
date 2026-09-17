// sang-logium-0bi.1 -- independent oracle for "do the 4 range sliders on the
// headphones page reflect the true data min/max?"
//
// Reuses the VFS-scope logic from 09-vfs-vs-category-scope-diff.mjs, queries
// the same field paths getFilterFacets.ts uses, and prints true min/max plus
// the product that holds each extreme. If the live page (FilterSidebar) shows
// bounds that differ from this, the source is getFilterFacets.ts or the
// rangeBounds prop path, not the underlying data.
//
// Run: node --env-file=.env.local lib/filter-sort/__tests__/10-range-facet-min-max-oracle.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { sanityQuery } from './sanityRaw.mjs';

const catalogueIndex = JSON.parse(
  readFileSync(new URL('../../../data/catalogue-index.json', import.meta.url), 'utf8'),
);

function unrollDescendantKeys(nodeId) {
  const slotMetadataMap = catalogueIndex.slotMetadataMap;
  if (!slotMetadataMap[nodeId]) return [nodeId];
  const result = new Set();
  const stack = [nodeId];
  while (stack.length > 0) {
    const currentId = stack.pop();
    if (result.has(currentId)) continue;
    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }
  return Array.from(result);
}

const FACETS = [
  {
    id: 'impedance',
    label: 'Impedance',
    field: 'impedanceOhms',
    unit: 'Ω',
  },
  {
    id: 'sensitivity',
    label: 'Sensitivity',
    field: 'sensitivityDbMw',
    unit: 'dB/mW',
  },
  {
    id: 'bassExtension',
    label: 'Frequency Response',
    field: 'freqResponseHz.min',
    unit: 'Hz',
  },
  {
    id: 'cableLength',
    label: 'Cable Length',
    field: 'cableLengthM',
    unit: 'm',
  },
];

function getValue(product, field) {
  const path = field.split('.');
  let cur = product.filterAttributes;
  for (const key of path) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = cur[key];
  }
  if (cur == null) return null;
  const num = Number(cur);
  return Number.isFinite(num) ? num : null;
}

function findExtremes(products, field) {
  let min = null;
  let max = null;
  let minProduct = null;
  let maxProduct = null;
  for (const p of products) {
    const v = getValue(p, field);
    if (v == null) continue;
    if (min === null || v < min) {
      min = v;
      minProduct = p;
    }
    if (max === null || v > max) {
      max = v;
      maxProduct = p;
    }
  }
  return { min, max, minProduct, maxProduct };
}

async function main() {
  const headphonesNodeId = catalogueIndex.slugToIdMap['headphones'];
  const keys = unrollDescendantKeys(headphonesNodeId);
  console.log(`headphones VFS node id: ${headphonesNodeId}`);
  console.log(`descendant keys: ${keys.length}`);

  const products = await sanityQuery(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]{
      _id, name,
      "filterAttributes": filterAttributes{
        impedanceOhms,
        sensitivityDbMw,
        cableLengthM,
        freqResponseHz
      }
    }`,
    { keys },
  );

  console.log(`\nVFS-scoped product count: ${products.length}\n`);

  const results = [];
  for (const facet of FACETS) {
    const { min, max, minProduct, maxProduct } = findExtremes(products, facet.field);
    console.log(`=== ${facet.label} (${facet.field}) ===`);
    console.log(`min: ${min != null ? `${min} ${facet.unit}` : 'no value'}${minProduct ? `  (${minProduct._id} -- ${minProduct.name})` : ''}`);
    console.log(`max: ${max != null ? `${max} ${facet.unit}` : 'no value'}${maxProduct ? `  (${maxProduct._id} -- ${maxProduct.name})` : ''}`);
    console.log('');
    results.push({
      id: facet.id,
      label: facet.label,
      field: facet.field,
      unit: facet.unit,
      min: { value: min, product: minProduct ? { _id: minProduct._id, name: minProduct.name } : null },
      max: { value: max, product: maxProduct ? { _id: maxProduct._id, name: maxProduct.name } : null },
    });
  }

  writeFileSync(
    new URL('./data/range-facet-min-max.json', import.meta.url),
    JSON.stringify(results, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
