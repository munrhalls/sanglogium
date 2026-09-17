// sang-logium-x9s -- correction of a scoping error in the whole proof suite.
//
// Every prior script (01-08) scoped "headphones" via filterAttributes.category.
// But the REAL /products/headphones page (app/(store)/products/[...slug]/page.tsx)
// does NOT use filterAttributes.category at all -- it resolves the "headphones"
// slug to a VFS node id (data/catalogue-index.json), unrolls its descendant
// keys, and scopes products via
//   count(catalogueLocationKeys[@ in $keys]) > 0
// (sanity-cms/lib/products/getProductsByVfsKeys.ts). These are two independent
// fields on the product document (filterAttributes.category vs
// catalogueLocationKeys) that nothing guarantees agree. This script computes
// the REAL VFS-scoped product set and diffs it against the category-based
// inventory every prior script trusted as "the headphones universe."
//
// Run: node --env-file=.env.local lib/filter-sort/__tests__/09-vfs-vs-category-scope-diff.mjs

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

async function main() {
  const headphonesNodeId = catalogueIndex.slugToIdMap['headphones'];
  const keys = unrollDescendantKeys(headphonesNodeId);
  console.log(`headphones VFS node id: ${headphonesNodeId}`);
  console.log(`descendant keys: ${keys.length}`);

  const vfsProducts = await sanityQuery(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]{
      _id, name, "category": filterAttributes.category
    }`,
    { keys },
  );
  console.log(`VFS-scoped product count (what /products/headphones actually serves): ${vfsProducts.length}`);

  const categoryInventory = JSON.parse(
    readFileSync(new URL('./data/headphones-inventory.json', import.meta.url), 'utf8'),
  );
  console.log(`filterAttributes.category="headphones" product count (what 01-08 assumed): ${categoryInventory.length}`);

  const categoryIds = new Set(categoryInventory.map((p) => p._id));
  const vfsIds = new Set(vfsProducts.map((p) => p._id));

  const inVfsNotCategory = vfsProducts.filter((p) => !categoryIds.has(p._id));
  const inCategoryNotVfs = categoryInventory.filter((p) => !vfsIds.has(p._id));

  console.log(`\n=== ON THE LIVE PAGE, but NEVER checked by any prior oracle/proof (in VFS scope, category tag missing/different) ===`);
  console.log(JSON.stringify(inVfsNotCategory, null, 2));

  console.log(`\n=== Checked by prior oracle/proof, but NOT actually on the live page (category tag says headphones, VFS scope disagrees) ===`);
  console.log(JSON.stringify(inCategoryNotVfs.map((p) => ({ _id: p._id, name: p.name, category: p.filterAttributes ?? p.category })), null, 2));

  console.log(`\nMISMATCH TOTAL: ${inVfsNotCategory.length + inCategoryNotVfs.length} product(s) disagree between the two scoping mechanisms.`);

  writeFileSync(
    new URL('./data/vfs-vs-category-scope-diff.json', import.meta.url),
    JSON.stringify({ inVfsNotCategory, inCategoryNotVfs: inCategoryNotVfs.map((p) => ({ _id: p._id, name: p.name })) }, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
