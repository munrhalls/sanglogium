#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "test", // Explicitly use test dataset for verification
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

async function verifyTestDataset() {
  console.log('Querying test dataset...\n');

  const query = `*[_type == "product"]{
    _id,
    name,
    slug,
    price_data,
    displayPrice,
    stock,
    reservedStock
  }`;

  try {
    const products = await client.fetch(query);
    console.log(`Found ${products.length} products in ${process.env.NEXT_PUBLIC_SANITY_DATASET} dataset\n`);

    console.log('--- Products ---');
    for (const product of products) {
      console.log(`ID: ${product._id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Slug: ${product.slug.current}`);
      console.log(`Price Data: ${JSON.stringify(product.price_data)}`);
      console.log(`Display Price: ${product.displayPrice}`);
      console.log(`Stock: ${product.stock}`);
      console.log(`Reserved Stock: ${product.reservedStock}`);
      console.log('---');
    }

    console.log(`\n✅ Verification complete: ${products.length} products found`);
  } catch (error) {
    console.error('Failed to query test dataset:', error);
    process.exit(1);
  }
}

verifyTestDataset();
