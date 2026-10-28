// One-off script: lists product documents holding keys the Studio schema does not know.
// With --apply: saves the stray values to a backup file, then removes the keys.
// One-off — the owner runs it manually.
// Run: node --env-file=/home/jan/work/sanglogium/.env.local scripts/remove-stray-filter-keys.mjs
// Apply: node --env-file=/home/jan/work/sanglogium/.env.local scripts/remove-stray-filter-keys.mjs --apply

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { createClient } from '@sanity/client';

const APPLY = process.argv.includes('--apply');
const BACKUP = 'scripts/output/stray-filter-keys-backup.json';

const STRAY_KEYS = ['accessoryCategory', 'compatibleModelOrBrand', 'availability', 'inStockOnly'];

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14',
  token: process.env.SANITY_STUDIO_READ_WRITE,
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
if (!APPLY) {
  console.log('dry run: nothing written. Add --apply to remove them.');
} else if (strays.length === 0) {
  console.log('nothing to remove.');
} else if (existsSync(BACKUP)) {
  console.log(`backup file exists, move it away first: ${BACKUP}`);
  process.exit(1);
} else {
  mkdirSync('scripts/output', { recursive: true });
  writeFileSync(BACKUP, JSON.stringify(strays, null, 2));
  const tx = client.transaction();
  for (const item of strays) {
    tx.patch(item.id, { unset: item.keys.map(({ key }) => 'filterAttributes.' + key) });
  }
  try {
    await tx.commit();
  } catch (error) {
    unlinkSync(BACKUP);
    throw error;
  }
  console.log(`removed ${count} keys from ${strays.length} products`);
}
