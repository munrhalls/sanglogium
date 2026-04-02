#!/usr/bin/env node

import { getProductBySlug } from '../sanity/lib/products/getProductBySlug.ts';

async function testHD569() {
  console.log('Testing getProductBySlug for sennheiser-hd-569-headphones...');
  
  try {
    const product = await getProductBySlug('sennheiser-hd-569-headphones');
    
    if (product) {
      console.log('✅ Product found:');
      console.log(`  _id: ${product._id}`);
      console.log(`  name: ${product.name}`);
      console.log(`  slug: ${product.slug.current}`);
      console.log(`  stock: ${product.stock}`);
      console.log(`  hasImage: ${!!product.image}`);
    } else {
      console.log('❌ Product NOT found (returned null)');
      console.log('   This would cause a 404 page');
    }
  } catch (error) {
    console.log('❌ Error fetching product:');
    console.log(error.message);
  }
}

testHD569();
