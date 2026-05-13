#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config({ path: ".env.test" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

// Simple 1x1 PNG placeholder image (transparent)
const PLACEHOLDER_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

const testBrand = {
  _type: 'brand',
  name: 'Test Brand',
  slug: { current: 'test-brand' }
};

const testProducts = [
  {
    _type: 'product',
    name: 'Test Product 1',
    slug: { current: 'test-product-1' },
    price_data: { currency: 'usd', unit_amount: 9999 },
    displayPrice: 99.99,
    stock: 10,
    reservedStock: 0,
    sku: 'TEST-001',
    catalogueLocationKeys: ['test-location'],
    overviewFields: [
      { title: 'Test Field', value: 'Test Value', information: 'Test Info' }
    ],
    specifications: [
      { title: 'Test Spec', value: 'Test Value', information: 'Test Info' }
    ]
  }
];

async function uploadPlaceholderImage() {
  console.log('Uploading placeholder image...');
  try {
    const buffer = Buffer.from(PLACEHOLDER_IMAGE_BASE64, 'base64');
    const asset = await client.assets.upload('image', buffer, {
      filename: 'placeholder.png',
      mimeType: 'image/png'
    });
    console.log('Uploaded image asset:', asset._id);
    return asset._id;
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
}

async function createTestProducts() {
  console.log('Creating test brand...');
  try {
    const brand = await client.create(testBrand);
    console.log('Created brand:', brand._id);

    // Update products to reference the created brand
    testProducts[0].brand = { _type: 'reference', _ref: brand._id };
  } catch (error) {
    console.error('Failed to create brand:', error);
    return;
  }

  console.log('Uploading placeholder image...');
  let imageAssetId;
  try {
    imageAssetId = await uploadPlaceholderImage();
    testProducts[0].image = { _type: 'image', asset: { _ref: imageAssetId } };
  } catch (error) {
    console.error('Failed to upload image, continuing without it:', error);
  }

  console.log('Creating test products...');

  for (const product of testProducts) {
    try {
      const created = await client.create(product);
      console.log('Created product:', created._id);
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  }

  console.log('Done');
}

createTestProducts();
