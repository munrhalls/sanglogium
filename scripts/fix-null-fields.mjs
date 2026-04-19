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

async function fixNullFields() {
  console.log('Fixing null fields in test products...\n');
  
  const query = `*[_type == "product" && name match "Test Product"]{
    _id,
    name,
    sku,
    catalogueLocationKeys
  }`;
  
  try {
    const products = await client.fetch(query);
    console.log('Found', products.length, 'test products\n');
    
    for (const product of products) {
      console.log('Checking:', product.name, '(' + product._id + ')');
      
      const updates = {};
      let needsUpdate = false;
      
      if (!product.sku) {
        updates.sku = 'TEST-' + product._id.slice(-6);
        needsUpdate = true;
        console.log('  Setting SKU:', updates.sku);
      }
      
      if (!product.catalogueLocationKeys || product.catalogueLocationKeys.length === 0) {
        updates.catalogueLocationKeys = ['test-location'];
        needsUpdate = true;
        console.log('  Setting catalogueLocationKeys: test-location');
      }
      
      if (needsUpdate) {
        try {
          await client.patch(product._id).set(updates).commit();
          console.log('  ✓ Updated');
        } catch (error) {
          console.error('  ✗ Failed to update:', error.message);
        }
      } else {
        console.log('  ✓ No null fields');
      }
    }
    
    console.log('\nDone. Run retrieve script to verify.');
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
}

fixNullFields();
