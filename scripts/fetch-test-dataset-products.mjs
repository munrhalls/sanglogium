#!/usr/bin/env node

import { createClient } from "next-sanity";
import dotenv from "dotenv";

// Load .env.test for test dataset configuration
dotenv.config({ path: ".env.test" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "test";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_API_TOKEN;

const testClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

async function fetchTestDatasetProducts() {
  console.log('🔍 Fetching products from test dataset...')

  try {
    const products = await testClient.fetch(
      `*[_type == "product"]{
        _id,
        name,
        slug { current },
        displayPrice,
        stock,
        stripePriceId,
        image
      } | order(name asc)`
    )

    console.log(`\n✅ Found ${products.length} products in test dataset:\n`)

    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`)
      console.log(`   ID: ${p._id}`)
      console.log(`   Slug: ${p.slug?.current}`)
      console.log(`   Stock: ${p.stock}`)
      console.log(`   Display Price: ${p.displayPrice}`)
      console.log(`   Stripe Price ID: ${p.stripePriceId}`)
      console.log(`   Has Image: ${p.image ? 'YES' : 'NO'}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

fetchTestDatasetProducts()
