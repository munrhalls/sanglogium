#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

// Target product: Meze Audio LIRIC II Headphones (Spotlight 1)
const PRODUCT_ID = "moXlkADK7m1DHgGwWtblBG";
const IMAGE_PATH = path.resolve("../sang-logium-data/images/meze-headphones-0-transparent-bg.png");

async function replaceMezeImage(dryRun = true) {
  console.log('=== Meze Headphones Image Replacement ===\n');
  console.log('Mode:', dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be applied)');
  console.log('Product ID:', PRODUCT_ID);
  console.log('Image path:', IMAGE_PATH);
  console.log();

  // Step 1: Verify image file exists
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error('ERROR: Image file not found:', IMAGE_PATH);
    process.exit(1);
  }
  console.log('✓ Image file exists');

  // Step 2: Fetch current product data
  const productQuery = `*[_id == "${PRODUCT_ID}"]{
    _id,
    name,
    slug,
    image,
    "currentImageRef": image.asset._ref
  }[0]`;

  const product = await client.fetch(productQuery);
  if (!product) {
    console.error('ERROR: Product not found with ID:', PRODUCT_ID);
    process.exit(1);
  }
  console.log('✓ Found product:', product.name);
  console.log('  Current image ref:', product.currentImageRef);

  // Step 3: Upload new image
  console.log('\nUploading new image...');
  const imageBuffer = fs.readFileSync(IMAGE_PATH);
  const asset = await client.assets.upload('image', imageBuffer, {
    filename: 'meze-headphones-0-transparent-bg.png',
    mimeType: 'image/png'
  });
  console.log('✓ Uploaded new image asset:', asset._id);
  console.log('  URL:', asset.url);

  // Step 4: Update product image reference
  console.log('\nUpdating product image reference...');
  if (dryRun) {
    console.log('[DRY RUN] Would patch product', PRODUCT_ID);
    console.log('[DRY RUN] Would set image to:', { _type: 'image', asset: { _ref: asset._id } });
    console.log('\n=== DRY RUN COMPLETE ===');
    console.log('To apply changes, run with --live flag');
  } else {
    await client.patch(PRODUCT_ID)
      .set({ image: { _type: 'image', asset: { _ref: asset._id } } })
      .commit();
    console.log('✓ Product image updated successfully');
    console.log('\n=== UPDATE COMPLETE ===');
    console.log('Old image ref:', product.currentImageRef);
    console.log('New image ref:', asset._id);
  }
}

// Parse command line args
const args = process.argv.slice(2);
const dryRun = !args.includes('--live');

replaceMezeImage(dryRun).catch(error => {
  console.error('ERROR:', error);
  process.exit(1);
});
