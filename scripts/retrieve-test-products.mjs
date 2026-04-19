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

async function retrieveTestProducts() {
  console.log('Retrieving test products from CMS...\n');

  const query = `*[_type == "product" && name match "Test Product"]{
    _id,
    name,
    slug,
    brand->{_id, name},
    stripePriceId,
    displayPrice,
    stock,
    reservedStock,
    sku,
    image,
    catalogueLocationKeys
  }`;

  try {
    const products = await client.fetch(query);
    console.log('Found', products.length, 'test products:\n');

    products.forEach(product => {
      console.log('---');
      console.log('ID:', product._id);
      console.log('Name:', product.name);
      console.log('Slug:', product.slug?.current || 'NO');
      console.log('Brand:', product.brand?.name || 'NO');
      console.log('Stripe Price ID:', product.stripePriceId);
      console.log('Display Price:', product.displayPrice);
      console.log('Stock:', product.stock);
      console.log('Reserved Stock:', product.reservedStock);
      console.log('SKU:', product.sku);
      console.log('Image Asset:', product.image?.asset?._ref || 'NO');
      console.log('Catalogue Locations:', product.catalogueLocationKeys);
      console.log('---\n');
    });

    console.log('Total test products:', products.length);
  } catch (error) {
    console.error('Failed to retrieve products:', error);
  }
}

retrieveTestProducts();
