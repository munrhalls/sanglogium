// One-off script: lists product documents holding keys the Studio schema does not know. Writes nothing.
// One-off — the owner runs it manually.
// Run: node --env-file=/home/jan/work/sanglogium/.env.local scripts/remove-stray-filter-keys.mjs

import { createClient } from '@sanity/client';

const STRAY_KEYS = ['accessoryCategory', 'compatibleModelOrBrand', 'availability', 'inStockOnly'];

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  perspective: 'raw',
});

async function findStrays() {
  const docs = await client.fetch(
    `*[_type == "product" && (defined(filterAttributes.accessoryCategory) || defined(filterAttributes.compatibleModelOrBrand) || defined(filterAttributes.availability) || defined(filterAttributes.inStockOnly) || defined(filterAttributes.price.currency) || defined(filterAttributes.price.min) || defined(filterAttributes.price.max) || defined(filterAttributes.price.unit_amount))]{ _id, filterAttributes }`
  );
  const results = [];
  for (const doc of docs) {
    const attrs = doc.filterAttributes || {};
    const keys = [];
    for (const name of STRAY_KEYS) {
      const value = attrs[name];
      if (value !== undefined && value !== null) keys.push({ key: name, value });
    }
    const price = attrs.price;
    if (typeof price === 'object' && price !== null) keys.push({ key: 'price', value: price });
    if (keys.length) results.push({ id: doc._id, keys });
  }
  return results;
}

const strays = await findStrays();
let count = 0;
for (const { id, keys } of strays) {
  for (const { key, value } of keys) {
    console.log(`${id} | ${key} | ${JSON.stringify(value)}`);
    count++;
  }
}
console.log(`${strays.length} products, ${count} keys`);
console.log('dry run: nothing written.');
