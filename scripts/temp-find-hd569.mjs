#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-11-14',
  useCdn: false
});

async function findHD569() {
  // Find products with HD 569 in the name
  const products = await client.fetch(`*[_type == "product" && name match "HD 569*"]{_id, name, slug, sku}`);
  console.log('Products matching "HD 569":');
  products.forEach(p => {
    console.log(`  _id: ${p._id}`);
    console.log(`  name: ${p.name}`);
    console.log(`  slug.current: ${p.slug?.current}`);
    console.log(`  sku: ${p.sku}`);
    console.log('---');
  });
  
  // Also check for any product with slug containing 569
  const bySlug = await client.fetch(`*[_type == "product" && slug.current match "*569*"]{_id, name, slug}`);
  console.log('\nProducts with "569" in slug:');
  bySlug.forEach(p => {
    console.log(`  slug.current: ${p.slug?.current} -> ${p.name}`);
  });
}

findHD569().catch(console.error);
