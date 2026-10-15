// Mission 02 printout: per slice, per sidebar group, the controls and option
// labels as the shopper sees them (options with 0 products in the slice are
// left out, as the sidebar does). Labels only, no counts.
//
// Run from repo root:
//   node --env-file=.env.local --experimental-strip-types tests/product-filtering/control-printout.mjs | less -S

import { readFileSync } from 'node:fs';
import { sanityQuery } from './sanity-raw.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

const read = (rel) => readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
const index = JSON.parse(read('data/catalogue-index.json'));

// ════════════════════════════════════════════════════════════
// ■ STEP 1 — EACH CATEGORY'S SIDEBAR DEFINITION
// ════════════════════════════════════════════════════════════
//   IN   :  the three category files under core/definitions/categories/
//   OUT  :  { groups, facets } per category, exactly as written in the files
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
//   OUT  :  the 3 roots + every "category/sub-slice" path; keysFor(node id) = node + all descendants
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
//   OUT  :  every product placed in the slice, with the fields the sidebar counts from
//   WHY  :  same selector and projection the sidebar's own fetch uses
// ════════════════════════════════════════════════════════════
const PRODUCTS_QUERY = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [0...1000] {
  _id, filterAttributes, "brandRef": brand->{ name, "slug": slug.current }, stock, reservedStock
}`;

// ════════════════════════════════════════════════════════════
// ■ STEP 4 — WHAT THE PRODUCTS CARRY
// ════════════════════════════════════════════════════════════
//   IN   :  products (STEP 3) and a facet id
//   OUT  :  the lower-cased values the products hold for that facet; in-stock test
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
//   OUT  :  text: groups in sidebar order, each with its controls and option labels
//   WHY  :  an option shows only if a product carries it; a group shows only if
//           something in it is selectable (price group always) — the sidebar's own rules
// ════════════════════════════════════════════════════════════
const WIDTH = 66;
const box = (title) => `┏${'━'.repeat(WIDTH)}┓\n┃  GROUP:  ${title.padEnd(WIDTH - 11)}┃\n┗${'━'.repeat(WIDTH)}┛`;

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

  return groups
    .filter(hasContent)
    .map((g) => {
      const title = g.label ? g.label.toUpperCase() : `(NO TITLE)  ·  ${g.id.toUpperCase()}`;
      const lines = [box(title), ''];
      if (g.id === 'commercial') lines.push('  ↔  PRICE', '');
      for (const f of facets.filter((x) => x.group === g.id)) {
        const name = f.label.toUpperCase();
        if (f.subheading) lines.push(`  ──  ${f.subheading.toUpperCase()}  ──`, '');
        if (f.control === 'range') lines.push(`  ↔  ${name}  (${f.unit})`, '');
        else if (f.control === 'boolean') boolShown(f) && lines.push(`  ◐  ${name}`, '');
        else lines.push(`  ▣  ${name}`, ...shownOptions(f).map((o) => `       ○  ${o}`), '');
      }
      return lines.join('\n');
    })
    .join('\n');
}

// ════════════════════════════════════════════════════════════
// ■ STEP 6 — PRINT
// ════════════════════════════════════════════════════════════
//   IN   :  every slice (STEP 2), its products (STEP 3), its sidebar text (STEP 5)
//   OUT  :  one banner per slice, 8 blank lines before it; one blank line between groups
//   WHY  :  one loop over all slices, nothing skipped, nothing reordered
// ════════════════════════════════════════════════════════════
for (const slice of slices) {
  const products = (await sanityQuery(PRODUCTS_QUERY, { keys: keysFor(index.slugToIdMap[slice]) })) ?? [];
  const bar = '█'.repeat(WIDTH + 2);
  console.log('\n'.repeat(8) + `${bar}\n██  SLICE:  ${slice.toUpperCase().replace('/', ' / ')}\n${bar}\n`);
  console.log(sidebarText(CATEGORIES[slice.split('/')[0]], products));
}
