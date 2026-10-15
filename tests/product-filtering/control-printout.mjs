// MISSION 02 — CONTROL PRINTOUT
//
// WHAT IT DOES:  prints, per slice and per sidebar group, the controls and option labels
//                the shopper sees. Options no product in the slice carries are left out
//                (as the sidebar does). Labels only, no counts.
//
// FLOW:          STEP 1 categories ─┐
//                STEP 2 slices ─────┼─► STEP 5 sidebar text ─► STEP 6 print
//                STEP 3 products ───┤
//                STEP 4 product values ┘
//
// RUN (repo root):
//   node --env-file=.env.local --experimental-strip-types tests/product-filtering/control-printout.mjs

import { readFileSync } from 'node:fs';
import { sanityQuery } from './sanity-raw.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

const read = (rel) => readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
const index = JSON.parse(read('data/catalogue-index.json'));

// ════════════════════════════════════════════════════════════
// ■ STEP 1 — EACH CATEGORY'S SIDEBAR DEFINITION
// ════════════════════════════════════════════════════════════
//   IN   :  the three category files under core/definitions/categories/
//   OUT  :  CATEGORIES['headphones'] = { groups: [commercial, type, sound, …],
//                                        facets: [brand, productCategory, …] }
//   WHY  :  the arrays are cut out of the file text, so nothing is added or dropped
// ════════════════════════════════════════════════════════════
const opts = (pairs) => pairs.map(([value, label]) => ({ value, label }));
function loadCategory(file) {
  const src = read(`features/product-filtering/core/definitions/categories/${file}.ts`);
  const grab = (name) => new Function('opts', `return ${src.match(new RegExp(`export const ${name}: \\w+\\[\\] = (\\[[\\s\\S]*?\\n\\]);`))[1]}`)(opts);
  return { groups: grab('FACET_GROUPS'), facets: grab('FACETS') };
}
const CATEGORIES = {
  headphones: loadCategory('headphones'),
  'audio-electronics': loadCategory('audioElectronics'),
  accessories: loadCategory('accessories'),
};

// ════════════════════════════════════════════════════════════
// ■ STEP 2 — SLICES AND THEIR KEY SETS
// ════════════════════════════════════════════════════════════
//   IN   :  slugToIdMap and slotMetadataMap from data/catalogue-index.json
//   OUT  :  slices = ['headphones', 'audio-electronics', 'accessories', 'headphones/open-back', …]
//           keysFor(node id) = ['o7c6…', …]  (the node + all its descendants)
//   WHY  :  the walk visits every descendant, so no product placed below a node is missed
// ════════════════════════════════════════════════════════════
const slices = ['headphones', 'audio-electronics', 'accessories', ...Object.keys(index.slugToIdMap).filter((s) => s.includes('/'))];
function keysFor(nodeId) {
  const seen = new Set();
  const stack = [nodeId];
  while (stack.length) {
    const id = stack.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...(index.slotMetadataMap[id]?.children ?? []));
  }
  return [...seen];
}

// ════════════════════════════════════════════════════════════
// ■ STEP 3 — A SLICE'S PRODUCTS
// ════════════════════════════════════════════════════════════
//   IN   :  a slice's key set (STEP 2)
//   OUT  :  [{ _id, filterAttributes, brandRef, stock, reservedStock }, …]  one per product in the slice
//   WHY  :  same selector and fields the sidebar's own fetch uses
// ════════════════════════════════════════════════════════════
const PRODUCTS_QUERY = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [0...1000] {
  _id, filterAttributes, "brandRef": brand->{ name, "slug": slug.current }, stock, reservedStock
}`;

// ════════════════════════════════════════════════════════════
// ■ STEP 4 — WHAT THE PRODUCTS CARRY
// ════════════════════════════════════════════════════════════
//   IN   :  products (STEP 3) and a facet id
//   OUT  :  valuesOf(product, 'acousticDesign') = ['open-back']
//           has(products, 'acousticDesign', 'open-back') = true / false
//           inStock(product) = true / false
//   WHY  :  reads the product's own field named in facetMap.ts, nothing else
// ════════════════════════════════════════════════════════════
function valuesOf(p, facetId) {
  const attribute = FILTER_FACETS.find((f) => f.urlParam === facetId).attribute;
  const raw = attribute.split('.').reduce((o, k) => (o == null ? undefined : o[k]), p.filterAttributes);
  if (raw == null) return [];
  return (Array.isArray(raw) ? raw : [raw]).map((v) => String(v).toLowerCase());
}
const inStock = (p) => (p.filterAttributes?.inStock != null ? Boolean(p.filterAttributes.inStock) : (p.stock ?? 0) - (p.reservedStock ?? 0) > 0);
const has = (products, facetId, value) => products.some((p) => valuesOf(p, facetId).includes(value.toLowerCase()));

// ════════════════════════════════════════════════════════════
// ■ STEP 5 — THE SIDEBAR, AS THE SHOPPER SEES IT
// ════════════════════════════════════════════════════════════
//   IN   :  a category definition (STEP 1) + the slice's products (STEP 3)
//   OUT  :  text. One chunk per group, in sidebar order; inside it one chunk per control:
//               SOUND PROPERTIES
//
//               Signature
//                 Neutral / Reference
//                 Warm
//   WHY  :  an option shows only if a product carries it; a group shows only if
//           something in it is selectable (the price group always) — the sidebar's own rules
// ════════════════════════════════════════════════════════════
function sidebarText({ groups, facets }, products) {
  const brandSlugs = [...new Set(products.flatMap((p) => valuesOf(p, 'brand')))].sort();
  const brandLabel = (slug) => products.find((p) => p.brandRef?.slug?.toLowerCase() === slug)?.brandRef.name ?? slug;

  const shownOptions = (f) =>
    f.options === 'derived'
      ? brandSlugs.map(brandLabel)
      : f.options.filter((o) => has(products, f.id, o.value)).map((o) => o.label);
  const boolShown = (f) => (f.id === 'inStock' ? products.some(inStock) : has(products, f.id, 'true'));
  const hasBounds = (f) => products.some((p) => valuesOf(p, f.id).length > 0);

  const hasContent = (g) => {
    if (g.id === 'commercial') return true;
    const fs = facets.filter((f) => f.group === g.id);
    if (fs.every((f) => f.control === 'range')) return fs.some(hasBounds);
    return fs.some((f) => (f.control === 'checkbox' ? shownOptions(f).length > 0 : f.control === 'boolean' ? boolShown(f) : false));
  };

  // One control = its name, then its options right under it.
  const controlChunk = (f) => {
    const sub = f.subheading ? `${f.subheading.toUpperCase()}\n` : '';
    if (f.control === 'range') return `${sub}${f.label} (${f.unit})`;
    if (f.control === 'boolean') return boolShown(f) ? `${sub}${f.label}` : null;
    return `${sub}${f.label}\n${shownOptions(f).map((o) => `  ${o}`).join('\n')}`;
  };

  return groups
    .filter(hasContent)
    .map((g) => {
      const title = g.label ? g.label.toUpperCase() : `(NO TITLE: ${g.id})`;
      const controls = facets.filter((x) => x.group === g.id).map(controlChunk).filter(Boolean);
      if (g.id === 'commercial') controls.unshift('Price');
      return `${title}\n\n${controls.join('\n\n')}`;
    })
    .join('\n\n\n\n');
}

// ════════════════════════════════════════════════════════════
// ■ STEP 6 — PRINT
// ════════════════════════════════════════════════════════════
//   IN   :  every slice (STEP 2), its products (STEP 3), its sidebar text (STEP 5)
//   OUT  :  the slice name, then its groups. The gap size says what belongs together:
//               8 blank lines  between slices
//               3 blank lines  between groups
//               1 blank line   between controls
//               0 blank lines  between a control and its options
//   WHY  :  one loop over all slices, nothing skipped, nothing reordered
// ════════════════════════════════════════════════════════════
for (const slice of slices) {
  const products = (await sanityQuery(PRODUCTS_QUERY, { keys: keysFor(index.slugToIdMap[slice]) })) ?? [];
  console.log('\n'.repeat(8) + slice.toUpperCase().replace('/', ' / ') + '\n\n');
  console.log(sidebarText(CATEGORIES[slice.split('/')[0]], products));
}
