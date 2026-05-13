#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

async function fetchRealProduct() {
  console.log('Fetching real product example...\n');

  // Fetch any product to see proper structure
  const query = `*[_type == "product"][0]{
    _id,
    name,
    slug,
    brand->{_id, name, slug},
    price_data,
    displayPrice,
    stock,
    reservedStock,
    sku,
    catalogueLocationKeys
  }`;

  try {
    const product = await client.fetch(query);
    console.log('Real Product Example:\n');
    console.log('---');
    console.log('ID:', product._id);
    console.log('Name:', product.name);
    console.log('Slug:', JSON.stringify(product.slug));
    console.log('Brand:', JSON.stringify(product.brand));
    console.log('Price Data:', JSON.stringify(product.price_data));
    console.log('Display Price:', product.displayPrice);
    console.log('Stock:', product.stock);
    console.log('Reserved Stock:', product.reservedStock);
    console.log('SKU:', product.sku);
    console.log('Catalogue Locations:', product.catalogueLocationKeys);
    console.log('---');
  } catch (error) {
    console.error('Failed to fetch product:', error);
  }
}

fetchRealProduct();
