#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN,
});

async function fetchSampleProducts() {
  console.log('Fetching 3 sample products...');
  
  const query = `*[_type == "product"] | order(_createdAt desc) [0..2] {
    _id,
    name,
    displayPrice,
    stripePriceId,
    stock,
    reservedStock,
    "catalogueLocations": catalogueLocationKeys[]
  }`;
  
  try {
    const products = await client.fetch(query);
    console.log('\n=== SAMPLE PRODUCTS ===\n');
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Price: $${product.displayPrice}`);
      console.log(`   Stripe ID: ${product.stripePriceId || 'MISSING'}`);
      console.log(`   Stock: ${product.stock || 0}`);
      console.log(`   Reserved: ${product.reservedStock || 0}`);
      console.log(`   Locations: ${product.catalogueLocations?.length || 0} catalogue slots`);
      console.log('');
    });
    
    // Save to file for manual inspection
    const fs = await import('fs');
    await fs.promises.writeFile('./sample-products.json', JSON.stringify(products, null, 2));
    console.log('Products saved to: sample-products.json');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchSampleProducts();
