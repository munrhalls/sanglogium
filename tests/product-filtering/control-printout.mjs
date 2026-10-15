// Mission 02 printout: per slice, per sidebar group, the controls and option
// labels as the shopper sees them (options with 0 products in the slice are
// left out, as the sidebar does). Labels only, no counts.
//
// Run from repo root:
//   node --env-file=.env.local --experimental-strip-types tests/product-filtering/control-printout.mjs

import { readFileSync } from 'node:fs';
import { sanityQuery } from './sanity-raw.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

const read = (rel) => readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8');
const index = JSON.parse(read('data/catalogue-index.json'));

// ── STEP 1: each category's sidebar definition ──
// In: the category source files. Out: { groups, facets } per category, as written in the files.
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

// ── STEP 2: slices and their key sets ──
// In: slugToIdMap + slotMetadataMap. Out: the 3 roots plus every "category/sub-slice" path;
// a slice's keys are its node plus all descendants (the walk the route uses).
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

// ── STEP 3: a slice's products ──
// In: key set. Out: every product placed in the slice (same projection the sidebar's counts use).
const PRODUCTS_QUERY = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(_id asc) [0...1000] {
  _id, filterAttributes, "brandRef": brand->{ name, "slug": slug.current }, stock, reservedStock
}`;

// ── STEP 4: what the products carry ──
// In: products + a facet id. Out: the lower-cased values each product holds for it.
function valuesOf(p, facetId) {
  const attribute = FILTER_FACETS.find((f) => f.urlParam === facetId).attribute;
  const raw = attribute.split('.').reduce((o, k) => (o == null ? undefined : o[k]), p.filterAttributes);
  if (raw == null) return [];
  return (Array.isArray(raw) ? raw : [raw]).map((v) => String(v).toLowerCase());
}
const inStock = (p) => (p.filterAttributes?.inStock != null ? Boolean(p.filterAttributes.inStock) : (p.stock ?? 0) - (p.reservedStock ?? 0) > 0);
const has = (products, facetId, value) => products.some((p) => valuesOf(p, facetId).includes(value.toLowerCase()));

// ── STEP 5: the sidebar, as the shopper sees it ──
// In: category definition + the slice's products. Out: text, groups in sidebar order,
// each group shown only if it has something selectable.
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
      const lines = [`[${g.label || g.id}]`];
      if (g.id === 'commercial') lines.push('  Price');
      for (const f of facets.filter((x) => x.group === g.id)) {
        if (f.subheading) lines.push(`  -- ${f.subheading} --`);
        if (f.control === 'range') lines.push(`  ${f.label} (${f.unit})`);
        else if (f.control === 'boolean') boolShown(f) && lines.push(`  ${f.label}`);
        else lines.push(`  ${f.label}: ${shownOptions(f).join(' | ')}`);
      }
      return lines.join('\n');
    })
    .join('\n\n');
}

// ── STEP 6: print ──
// Wide gap between slices, one blank line between groups.
for (const slice of slices) {
  const products = (await sanityQuery(PRODUCTS_QUERY, { keys: keysFor(index.slugToIdMap[slice]) })) ?? [];
  console.log('\n'.repeat(8) + `==================== ${slice} ====================\n`);
  console.log(sidebarText(CATEGORIES[slice.split('/')[0]], products));
}
