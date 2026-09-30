import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sanityQuery } from '../../features/product-filtering/__tests__/proofs/sanityRaw.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export const loadCatalogue = () =>
  JSON.parse(readFileSync(join(repoRoot, 'data', 'catalogue-index.json'), 'utf8'));

const catalogue = loadCatalogue();

export const ROOTS = {
  'headphones': catalogue.slugToIdMap['headphones'],
  'audio-electronics': catalogue.slugToIdMap['audio-electronics'],
  'accessories': catalogue.slugToIdMap['accessories'],
};

// Same algorithm as unrollDescendantKeys in data/catalogue.ts
export const unroll = (nodeId) => {
  const slotMetadataMap = catalogue.slotMetadataMap;
  if (!slotMetadataMap[nodeId]) return [nodeId];
  const result = new Set();
  const stack = [nodeId];
  while (stack.length > 0) {
    const currentId = stack.pop();
    if (result.has(currentId)) continue;
    result.add(currentId);
    stack.push(...(slotMetadataMap[currentId]?.children || []));
  }
  return Array.from(result);
};

export const fetchProducts = async () => {
  const products = await sanityQuery(
    '*[_type=="product" && !(_id in path("drafts.**"))]{_id, name, "slug": slug.current, "brand": brand->name, catalogueLocationKeys, filterAttributes}',
  );
  const draftCount = await sanityQuery(
    'count(*[_type=="product" && (_id in path("drafts.**"))])',
  );
  return { products, draftCount };
};

export const visibleSet = (slice, products) => {
  const keys = new Set(unroll(ROOTS[slice]));
  return new Set(
    products.filter(
      (p) => Array.isArray(p.catalogueLocationKeys) &&
        p.catalogueLocationKeys.some((k) => keys.has(k)),
    ).map((p) => p._id),
  );
};

export const assertParity = async (slice, products) => {
  const keys = unroll(ROOTS[slice]);
  const live = await sanityQuery(
    'count(*[_type=="product" && !(_id in path("drafts.**")) && count(catalogueLocationKeys[@ in $keys]) > 0])',
    { keys },
  );
  const mine = visibleSet(slice, products).size;
  if (live !== mine) {
    throw new Error(`PARITY FAIL ${slice}: live=${live} memory=${mine}`);
  }
  return { slice, live, mine };
};
