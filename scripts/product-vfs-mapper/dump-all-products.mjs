#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
import { config } from 'dotenv';
config();

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
  useCdn: false
});

async function dumpAllProductIds() {
  console.log('Fetching all product IDs from Sanity CMS...');
  
  const query = '*[_type == "product"]{_id, name}';
  const products = await client.fetch(query);
  
  console.log(`Found ${products.length} products`);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const content = `# All Product IDs - ${timestamp}\n\n` +
    `Total Products: ${products.length}\n\n` +
    `## Product IDs\n\n`;
  
  let productList = '';
  products.forEach((product, index) => {
    productList += `${index + 1}. \`${product._id}\` - ${product.name || 'Unknown'}\n`;
  });
  
  const fullContent = content + productList;
  
  const outputFile = join(process.cwd(), 'catalog_temporary', 'unmapped_products.md');
  writeFileSync(outputFile, fullContent);
  
  console.log(`Product IDs dumped to: catalog_temporary/unmapped_products.md`);
  console.log(`Total products written: ${products.length}`);
}

dumpAllProductIds().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
