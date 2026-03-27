#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
config({ path: '.env.local' });

function assertValue(v, errorMessage) {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  useCdn: false
});

async function emptyCatalogueLocationKeys(productId) {
  console.log(`🗑️  Emptying catalogueLocationKeys for product: ${productId}`);

  try {
    // Check current state
    const productQuery = '*[_type == "product" && _id == $productId][0]{name, catalogueLocationKeys}';
    const product = await client.fetch(productQuery, { productId });

    if (!product) {
      console.error(`❌ Product not found: ${productId}`);
      return false;
    }

    console.log(`📋 Product: ${product.name}`);
    console.log(`📊 Current catalogueLocationKeys: ${JSON.stringify(product.catalogueLocationKeys)}`);
    console.log(`📈 Current count: ${product.catalogueLocationKeys ? product.catalogueLocationKeys.length : 0}`);

    // Empty the array
    const transaction = client.transaction();
    transaction.patch(productId, (patch) => {
      return patch.unset(['catalogueLocationKeys']);
    });

    await transaction.commit();

    console.log('✅ catalogueLocationKeys array emptied successfully');

    // Verify the change
    const updatedProduct = await client.fetch(productQuery, { productId });
    console.log(`📊 New catalogueLocationKeys: ${JSON.stringify(updatedProduct.catalogueLocationKeys)}`);
    console.log(`📈 New count: ${updatedProduct.catalogueLocationKeys ? updatedProduct.catalogueLocationKeys.length : 0}`);

    return true;

  } catch (error) {
    console.error(`❌ Error emptying catalogueLocationKeys: ${error.message}`);
    return false;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const productIdIndex = args.findIndex(arg => arg.startsWith('--productId='));
  const productId = productIdIndex !== -1 ? args[productIdIndex].split('=')[1] : null;

  if (!productId) {
    console.error('❌ Error: --productId is required');
    console.log('Usage: node emptyCatalogueLocationKeys.mjs --productId=<product-id>');
    process.exit(1);
  }

  console.log('🚀 Starting catalogueLocationKeys empty operation...\n');

  const success = await emptyCatalogueLocationKeys(productId);

  if (success) {
    console.log('\n🎉 Operation completed successfully!');
  } else {
    console.log('\n❌ Operation failed!');
    process.exit(1);
  }
}

// Export function for use in other scripts
export { emptyCatalogueLocationKeys };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Script error:', error.message);
    process.exit(1);
  });
}
