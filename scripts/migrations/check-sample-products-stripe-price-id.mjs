#!/usr/bin/env node

import { createClient } from '@sanity/client';
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

// Query to check a sample of products and their stripePriceId status
const query = `*[_type == "product"][0..10] {
  _id,
  name,
  stripePriceId,
  "hasStripePriceId": defined(stripePriceId),
  "stripePriceIdValue": stripePriceId
}`;

async function checkSampleProducts() {
  console.log('Checking sample products for stripePriceId...');
  
  try {
    const products = await client.fetch(query);
    
    console.log(`\nSample of ${products.length} products:`);
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Has stripePriceId: ${product.hasStripePriceId}`);
      console.log(`   StripePriceId: ${product.stripePriceId || 'MISSING'}`);
    });
    
    // Also check total counts
    const totalQuery = `{
      "totalProducts": count(*[_type == "product"]),
      "withStripePriceId": count(*[_type == "product" && defined(stripePriceId)]),
      "withoutStripePriceId": count(*[_type == "product" && !defined(stripePriceId)])
    }`;
    
    const counts = await client.fetch(totalQuery);
    console.log('\n=== TOTAL COUNTS ===');
    console.log(`Total products: ${counts.totalProducts}`);
    console.log(`With stripePriceId: ${counts.withStripePriceId}`);
    console.log(`Without stripePriceId: ${counts.withoutStripePriceId}`);
    
  } catch (error) {
    console.error('Error fetching products:', error);
    process.exit(1);
  }
}

checkSampleProducts();
