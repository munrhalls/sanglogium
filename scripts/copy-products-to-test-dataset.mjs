#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

// Production client for reading
const productionClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

// Test dataset client for writing
const testClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "test",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

async function copyProductsToTestDataset() {
  console.log('Fetching 10 products from production dataset...\n');

  // Fetch 10 products from production
  const query = `*[_type == "product"][0..9]{
    _id,
    name,
    slug,
    brand->{_id, name, slug},
    stripePriceId,
    displayPrice,
    stock,
    reservedStock,
    sku,
    catalogueLocationKeys,
    image,
    description,
    specifications,
    overviewFields
  }`;

  try {
    const products = await productionClient.fetch(query);
    console.log(`Found ${products.length} products in production\n`);

    for (const product of products) {
      console.log(`Copying: ${product.name}`);

      // Create copy with "Test " prefix
      const testProduct = {
        ...product,
        _id: undefined, // Let Sanity generate new ID
        _type: "product", // Include document type
        image: undefined, // Remove image reference (assets not in test dataset)
        name: `Test ${product.name}`,
        slug: {
          ...product.slug,
          current: `test-${product.slug.current}`
        },
        stock: 10, // Set reasonable stock for testing
        reservedStock: 0, // Reset reserved stock
      };

      // Create in test dataset
      const result = await testClient.create(testProduct);
      console.log(`  → Created in test dataset with ID: ${result._id}`);
    }

    console.log('\n✅ Successfully copied all products to test dataset');
  } catch (error) {
    console.error('Failed to copy products:', error);
    process.exit(1);
  }
}

copyProductsToTestDataset();
