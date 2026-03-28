#!/usr/bin/env node
/**
 * TWS Product Archive Migration Script
 * 
 * Archives all products assigned to the True Wireless (TWS) category.
 * Changes _type from "product" to "archivedProduct" and removes TWS from catalogueLocationKeys.
 * 
 * Usage:
 *   --dry-run    Preview changes without executing
 *   --execute    Execute the migration
 * 
 * Example:
 *   node scripts/migrate-tws-to-archive.mjs --dry-run
 *   node scripts/migrate-tws-to-archive.mjs --execute
 */

import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

config();

const TWS_CATEGORY_ID = 'sbbu2eig5fx84uht05ic863j';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN // Requires token for mutations
});

async function findTWSProducts() {
  console.log('🔍 Querying for TWS-assigned products...');
  
  const query = `*[_type == "product" && "${TWS_CATEGORY_ID}" in catalogueLocationKeys]{
    _id,
    _type,
    name,
    brand,
    catalogueLocationKeys,
    slug,
    displayPrice,
    stock
  }`;
  
  try {
    const products = await client.fetch(query);
    console.log(`📊 Found ${products.length} products assigned to TWS category`);
    
    if (products.length > 0) {
      console.log('\n📋 Products to archive:');
      products.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} (${p.brand}) - ID: ${p._id}`);
      });
    }
    
    return products;
  } catch (err) {
    console.error('❌ Error querying products:', err.message);
    throw err;
  }
}

async function exportProductList(products) {
  const exportPath = join(process.cwd(), '_project', 'tws-products-archive-list.json');
  const exportData = {
    exportedAt: new Date().toISOString(),
    categoryId: TWS_CATEGORY_ID,
    categorySlug: 'true-wireless-tws',
    productCount: products.length,
    products: products.map(p => ({
      _id: p._id,
      name: p.name,
      brand: p.brand,
      slug: p.slug,
      displayPrice: p.displayPrice,
      stock: p.stock,
      catalogueLocationKeys: p.catalogueLocationKeys
    }))
  };
  
  writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
  console.log(`💾 Product list exported to: ${exportPath}`);
}

async function createBackup(products) {
  const backupPath = join(process.cwd(), 'sanity', 'backups', `tws-archive-backup-${new Date().toISOString().split('T')[0]}.json`);
  const backupData = {
    backedUpAt: new Date().toISOString(),
    reason: 'TWS category removal - product archival',
    originalType: 'product',
    targetType: 'archivedProduct',
    products: products
  };
  
  writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`💾 Backup created: ${backupPath}`);
  return backupPath;
}

async function archiveProducts(products, dryRun = true) {
  console.log(`\n${dryRun ? '🔍 DRY RUN' : '⚡ EXECUTING'}: Archiving ${products.length} products...`);
  
  const results = {
    success: [],
    failed: []
  };
  
  for (const product of products) {
    try {
      // Filter out TWS from catalogueLocationKeys
      const newKeys = (product.catalogueLocationKeys || [])
        .filter(key => key !== TWS_CATEGORY_ID);
      
      if (dryRun) {
        console.log(`  📦 Would archive: ${product.name}`);
        console.log(`     - Remove TWS key from catalogueLocationKeys`);
        console.log(`     - Change _type: "product" → "archivedProduct"`);
        console.log(`     - Remaining keys: ${newKeys.length > 0 ? newKeys.join(', ') : 'none'}`);
        results.success.push(product._id);
      } else {
        // Execute the mutation
        const result = await client
          .patch(product._id)
          .set({
            _type: 'archivedProduct',
            archiveReason: 'Category removed - off-theme (TWS)',
            archivedAt: new Date().toISOString(),
            originalType: 'product',
            catalogueLocationKeys: newKeys // Remove TWS key
          })
          .commit();
        
        console.log(`  ✅ Archived: ${product.name} → ${result._id}`);
        results.success.push(product._id);
      }
    } catch (err) {
      console.error(`  ❌ Failed to archive ${product.name}: ${err.message}`);
      results.failed.push({ id: product._id, error: err.message });
    }
  }
  
  return results;
}

async function verifyArchival() {
  console.log('\n🔍 Verifying archival...');
  
  const remainingQuery = `*[_type == "product" && "${TWS_CATEGORY_ID}" in catalogueLocationKeys]{_id, name}`;
  const archivedQuery = `*[_type == "archivedProduct" && "${TWS_CATEGORY_ID}" in catalogueLocationKeys || archiveReason match "TWS"]{_id, name}`;
  
  try {
    const remaining = await client.fetch(remainingQuery);
    const archived = await client.fetch(archivedQuery);
    
    console.log(`  📊 Products still with TWS key: ${remaining.length}`);
    console.log(`  📊 Products archived: ${archived.length}`);
    
    if (remaining.length === 0) {
      console.log('  ✅ All TWS products successfully archived');
      return true;
    } else {
      console.log('  ⚠️ Some products still have TWS key:');
      remaining.forEach(p => console.log(`     - ${p.name} (${p._id})`));
      return false;
    }
  } catch (err) {
    console.error('  ❌ Verification failed:', err.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const execute = args.includes('--execute');
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔧 TWS PRODUCT ARCHIVE MIGRATION');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (!dryRun && !execute) {
    console.log('Usage:');
    console.log('  node scripts/migrate-tws-to-archive.mjs --dry-run');
    console.log('  node scripts/migrate-tws-to-archive.mjs --execute');
    console.log('\n⚠️  Use --dry-run first to preview changes!');
    process.exit(1);
  }
  
  try {
    // Step 1: Find TWS products
    const products = await findTWSProducts();
    
    // Step 2: Export product list
    await exportProductList(products);
    
    if (products.length === 0) {
      console.log('\n✅ No TWS products found. Nothing to archive.');
      process.exit(0);
    }
    
    // Step 3: Create backup (always, even in dry-run)
    await createBackup(products);
    
    // Step 4: Archive products
    const results = await archiveProducts(products, dryRun);
    
    console.log(`\n📊 Results:`);
    console.log(`  Success: ${results.success.length}`);
    console.log(`  Failed: ${results.failed.length}`);
    
    if (!dryRun && results.success.length > 0) {
      // Step 5: Verify archival
      const verified = await verifyArchival();
      
      if (verified) {
        console.log('\n🎉 TWS product archival completed successfully!');
      } else {
        console.log('\n⚠️  Some products may not have been archived correctly.');
        process.exit(1);
      }
    }
    
    if (dryRun) {
      console.log('\n🔍 This was a DRY RUN. No changes were made.');
      console.log('   Run with --execute to apply changes.');
    }
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

main();
