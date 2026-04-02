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

async function findValidProduct() {
  // Get a product with image and stock that should render
  const products = await client.fetch(`
    *[_type == "product" && defined(slug.current) && defined(image) && stock > 0][0...5] {
      _id, name, slug, stock, "hasImage": defined(image)
    }
  `);
  
  console.log('Valid products for testing:');
  products.forEach(p => {
    console.log(`  slug: ${p.slug.current}`);
    console.log(`  name: ${p.name}`);
    console.log(`  stock: ${p.stock}`);
    console.log('---');
  });
}

findValidProduct().catch(console.error);
