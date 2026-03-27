#!/usr/bin/env node

import { createClient } from '@sanity/client';

// Load environment variables from .env.local
import { config } from 'dotenv';
config();

function assertValue(v, errorMessage) {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false
});

async function verifyProductMapping(productId) {
  const productQuery = `*[_type == "product" && _id == $productId][0]{name, catalogueLocationKeys}`;
  const product = await client.fetch(productQuery, { productId });

  if (!product || !product.catalogueLocationKeys) {
    console.error('Product not found or no catalogueLocationKeys');
    return false;
  }

  console.log(`\n=== Verifying Product: ${product.name} ===`);
  console.log(`Assigned leaf nodes: ${product.catalogueLocationKeys.join(', ')}\n`);

  let passedTests = 0;
  let totalTests = 0;

  // Positive Leaf Tests
  console.log('--- Positive Leaf Tests ---');
  for (const leafId of product.catalogueLocationKeys) {
    totalTests++;
    try {
      const leafQuery = `*[_type == "catalogueItem" && _id == $leafId][0]{title, slug}`;
      const leafNode = await client.fetch(leafQuery, { leafId });

      const productInLeafQuery = `*[_type == "product" && catalogueLocationKeys[$leafId] match $leafId]{name}`;
      const productsInLeaf = await client.fetch(productInLeafQuery, { leafId });

      const found = productsInLeaf.some(p => p.name === product.name);

      if (found) {
        console.log(`✅ PASS: Product found in leaf "${leafNode.title}"`);
        passedTests++;
      } else {
        console.log(`❌ FAIL: Product NOT found in leaf "${leafNode.title}"`);
      }
    } catch (error) {
      console.log(`❌ ERROR: Failed to verify leaf ${leafId}: ${error.message}`);
    }
  }

  // Positive Header Tests
  console.log('\n--- Positive Header Tests ---');
  const headerTests = [
    { id: 'headphones', title: 'Headphones' },
    { id: 'by-design', title: 'By Design' }
  ];

  for (const headerTest of headerTests) {
    totalTests++;
    try {
      const headerQuery = `*[_type == "catalogueItem" && _id == $headerId][0]{title}`;
      const headerNode = await client.fetch(headerQuery, { headerId: headerTest.id });

      const productInHeaderQuery = `*[_type == "catalogueItem" && _id == $headerId]{
        "products": *[_type == "product" && catalogueLocationKeys[$leafId] match ^catalogueLocationKeys[_type == "catalogueItem" && parent._ref == $headerId]._id]
      }.products{name}`;
      const productsInHeader = await client.fetch(productInHeaderQuery, { headerId: headerTest.id });

      const found = productsInHeader.some(p => p.name === product.name);

      if (found) {
        console.log(`✅ PASS: Product found in header "${headerNode.title}"`);
        passedTests++;
      } else {
        console.log(`❌ FAIL: Product NOT found in header "${headerTest.title}"`);
      }
    } catch (error) {
      console.log(`❌ ERROR: Failed to verify header ${headerTest.title}: ${error.message}`);
    }
  }

  // Negative Co-Branch Tests
  console.log('\n--- Negative Co-Branch Tests ---');
  const negativeTests = [
    { id: 'open-back', title: 'Open-Back' },
    { id: 'planar-magnetic', title: 'Planar Magnetic' }
  ];

  for (const negativeTest of negativeTests) {
    totalTests++;
    try {
      const productInNegativeQuery = `*[_type == "product" && catalogueLocationKeys[$leafId] match $leafId]{name}`;
      const productsInNegative = await client.fetch(productInNegativeQuery, { leafId: negativeTest.id });

      const found = productsInNegative.some(p => p.name === product.name);

      if (!found) {
        console.log(`✅ PASS: Product correctly NOT found in "${negativeTest.title}"`);
        passedTests++;
      } else {
        console.log(`❌ FAIL: Product incorrectly found in "${negativeTest.title}"`);
      }
    } catch (error) {
      console.log(`❌ ERROR: Failed to verify negative test ${negativeTest.title}: ${error.message}`);
    }
  }

  console.log(`\n=== Test Results: ${passedTests}/${totalTests} passed ===`);
  return passedTests === totalTests;
}

async function main() {
  const args = process.argv.slice(2);
  const productIdIndex = args.findIndex(arg => arg.startsWith('--productId='));
  const productId = productIdIndex !== -1 ? args[productIdIndex].split('=')[1] : null;

  if (!productId) {
    console.error('Error: --productId is required');
    process.exit(1);
  }

  try {
    const success = await verifyProductMapping(productId);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Verification error:', error.message);
    process.exit(1);
  }
}

main();
