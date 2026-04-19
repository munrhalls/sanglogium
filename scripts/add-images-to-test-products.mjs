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

// Simple 1x1 PNG placeholder image (transparent)
const PLACEHOLDER_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

async function addImagesToAllProducts() {
  console.log('Adding images to all test products...\n');

  // First, upload or get the placeholder image
  let imageAssetId;
  try {
    const buffer = Buffer.from(PLACEHOLDER_IMAGE_BASE64, 'base64');
    const asset = await client.assets.upload('image', buffer, {
      filename: 'placeholder.png',
      mimeType: 'image/png'
    });
    imageAssetId = asset._id;
    console.log('Using image asset:', imageAssetId);
  } catch (error) {
    console.error('Failed to upload image:', error);
    return;
  }

  // Get all products without images or with invalid image references
  const query = `*[_type == "product" && name match "Test Product"]{
    _id,
    name,
    image
  }`;

  try {
    const products = await client.fetch(query);
    const productsWithoutImages = products.filter(p => !p.image || !p.image.asset);
    console.log('Found', productsWithoutImages.length, 'products without valid images\n');

    for (const product of productsWithoutImages) {
      console.log('Adding image to:', product.name, '(' + product._id + ')');
      try {
        await client.patch(product._id)
          .set({ image: { _type: 'image', asset: { _ref: imageAssetId } } })
          .commit();
        console.log('  ✓ Image added');
      } catch (error) {
        console.error('  ✗ Failed to add image:', error.message);
      }
    }

    console.log('\nDone. Run retrieve script to verify.');
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
}

addImagesToAllProducts();
