#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { config } from 'dotenv';

config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_STUDIO_READ_WRITE
});

// Orphaned keys that don't exist in VFS slotMetadataMap
const ORPHANED_KEYS = [
  'test-category-beta',
  'test-category-gamma',
  'test-location',
  'test-category-alpha',
  'featured'
];

async function removeOrphanedKeys(dryRun = false) {
  console.log('🔍 Fetching products with orphaned catalogueLocationKeys...');

  // Fetch all products with catalogueLocationKeys (same as build script)
  const allProducts = await client.fetch(`
    *[_type == "product" && defined(catalogueLocationKeys)]{
      _id,
      name,
      catalogueLocationKeys
    }
  `);

  // Filter to products that have orphaned keys
  const products = allProducts.filter(product => 
    product.catalogueLocationKeys && 
    product.catalogueLocationKeys.some(key => ORPHANED_KEYS.includes(key))
  );

  if (products.length === 0) {
    console.log('✅ No products found with orphaned keys');
    return;
  }

  console.log(`\nFound ${products.length} product(s) with orphaned keys:\n`);

  for (const product of products) {
    const orphanedInProduct = product.catalogueLocationKeys.filter(key => 
      ORPHANED_KEYS.includes(key)
    );
    console.log(`- ${product.name} (${product._id})`);
    console.log(`  Orphaned keys: ${orphanedInProduct.join(', ')}`);
  }

  if (dryRun) {
    console.log('\n🔍 DRY RUN - No changes will be made');
    return;
  }

  console.log('\n🔧 Removing orphaned keys from products...');

  const transaction = client.transaction();

  for (const product of products) {
    const validKeys = product.catalogueLocationKeys.filter(key => 
      !ORPHANED_KEYS.includes(key)
    );

    transaction.patch(product._id, {
      set: { catalogueLocationKeys: validKeys }
    });

    console.log(`  - Updating ${product.name}: removing ${product.catalogueLocationKeys.length - validKeys.length} key(s)`);
  }

  await transaction.commit();
  console.log('\n✅ Migration completed successfully');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  try {
    await removeOrphanedKeys(dryRun);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
