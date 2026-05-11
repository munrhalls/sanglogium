#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🗑️  Removing stripePriceId and categoryPath from products...');

  const filePath = path.join(process.cwd(), 'scripts', 'migrations', 'parcel-migration', 'products-to-products-with-parcel-data.json');

  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));

  console.log(`📋 Processing ${data.products.length} products`);

  let removedStripePriceIdCount = 0;
  let removedCategoryPathCount = 0;

  for (const product of data.products) {
    if (product.stripePriceId) {
      delete product.stripePriceId;
      removedStripePriceIdCount++;
    }
    if (product.categoryPath) {
      delete product.categoryPath;
      removedCategoryPathCount++;
    }
  }

  console.log(`✅ Removed stripePriceId from ${removedStripePriceIdCount} products`);
  console.log(`✅ Removed categoryPath from ${removedCategoryPathCount} products`);

  await fs.writeFile(filePath, JSON.stringify(data, null, 2));

  console.log(`📂 Saved to: ${filePath}`);
}

main().catch(console.error);
