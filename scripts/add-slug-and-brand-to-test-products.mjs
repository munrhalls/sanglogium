#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function addSlugAndBrand() {
  console.log('Adding slug and brand to all test products...\n');
  
  // First, get the Meze brand ID (from real product example)
  const brandQuery = `*[_type == "brand" && name == "Meze"][0]._id`;
  let brandId;
  try {
    brandId = await client.fetch(brandQuery);
    console.log('Using existing brand:', brandId);
  } catch (error) {
    console.error('Failed to fetch brand:', error);
    return;
  }
  
  // Get all test products
  const query = `*[_type == "product" && name match "Test Product"]{
    _id,
    name,
    slug,
    brand
  }`;
  
  try {
    const products = await client.fetch(query);
    console.log('Found', products.length, 'test products\n');
    
    for (const product of products) {
      console.log('Processing:', product.name, '(' + product._id + ')');
      
      const updates = {};
      let needsUpdate = false;
      
      if (!product.slug || !product.slug.current) {
        updates.slug = { _type: 'slug', current: generateSlug(product.name) };
        needsUpdate = true;
        console.log('  Setting slug:', updates.slug.current);
      }
      
      if (!product.brand || !product.brand._ref) {
        updates.brand = { _type: 'reference', _ref: brandId };
        needsUpdate = true;
        console.log('  Setting brand reference:', brandId);
      }
      
      if (needsUpdate) {
        try {
          await client.patch(product._id).set(updates).commit();
          console.log('  ✓ Updated');
        } catch (error) {
          console.error('  ✗ Failed to update:', error.message);
        }
      } else {
        console.log('  ✓ Already has slug and brand');
      }
    }
    
    console.log('\nDone. Run retrieve script to verify.');
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
}

addSlugAndBrand();
