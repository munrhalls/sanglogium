#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false
});

async function findProductWithRelated() {
  // Find products that have catalogue keys (means they have related products)
  const products = await client.fetch(`
    *[_type == "product" && count(catalogueLocationKeys) > 0][0...20] {
      _id, name, slug, "keyCount": count(catalogueLocationKeys)
    }
  `);
  
  console.log('Products with catalogue keys:');
  products.forEach(p => {
    console.log(`  ${p.slug.current} | ${p.name} | keys: ${p.keyCount}`);
  });
  
  // Test first product for related products
  if (products.length > 0) {
    const testProduct = products[0];
    console.log(`\nTesting related products for: ${testProduct.name}`);
    
    const related = await client.fetch(`
      *[_type == "product"
        && _id != $currentId
        && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0
      ] | order(displayPrice asc) [0...6] {
        _id, name, slug
      }
    `, { 
      currentId: testProduct._id, 
      catalogueKeys: testProduct.catalogueLocationKeys 
    });
    
    console.log(`Found ${related.length} related products:`);
    related.forEach(r => {
      console.log(`  - ${r.slug.current} (${r.name})`);
    });
  }
}

findProductWithRelated().catch(console.error);
