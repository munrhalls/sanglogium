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

// Query to find all products that don't have stripePriceId
const query = `*[_type == "product" && !defined(stripePriceId)] {
  _id,
  name,
  slug,
  brand->{name, slug},
  price,
  compareAtPrice,
  sku,
  status,
  stock,
  images,
  description,
  specifications,
  overviewFields,
  catalogueLocationKeys,
  "missingFields": {
    "stripePriceId": !defined(stripePriceId)
  }
}`;

async function fetchProductsWithoutStripePriceId() {
  console.log('Fetching products without stripePriceId...');

  try {
    const products = await client.fetch(query);

    console.log(`Found ${products.length} products without stripePriceId`);

    if (products.length > 0) {
      // Save to file
      const filename = `products-missing-stripe-price-id-${new Date().toISOString().split('T')[0]}.json`;
      const filepath = join(process.cwd(), filename);

      writeFileSync(filepath, JSON.stringify(products, null, 2));
      console.log(`\nSaved to: ${filename}`);

      // Show summary
      console.log('\nSummary of products missing stripePriceId:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.brand?.name || 'No brand'}) - SKU: ${product.sku || 'No SKU'}`);
      });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }
}

fetchProductsWithoutStripePriceId();
