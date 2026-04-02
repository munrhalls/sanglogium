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

async function testHD569() {
  console.log('Testing direct Sanity query for sennheiser-hd-569-headphones...');
  
  try {
    const query = `*[_type == "product" && slug.current == "sennheiser-hd-569-headphones"][0] {
      _id, name, slug, stock, "hasImage": defined(image)
    }`;
    
    const product = await client.fetch(query);
    
    if (product) {
      console.log('✅ Product found in Sanity:');
      console.log(`  _id: ${product._id}`);
      console.log(`  name: ${product.name}`);
      console.log(`  slug: ${product.slug?.current}`);
      console.log(`  stock: ${product.stock}`);
      console.log(`  hasImage: ${product.hasImage}`);
    } else {
      console.log('❌ Product NOT found in Sanity');
    }
  } catch (error) {
    console.log('❌ Error fetching product:');
    console.log(error.message);
  }
}

testHD569();
