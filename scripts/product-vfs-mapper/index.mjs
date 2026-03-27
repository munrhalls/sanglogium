#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

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

async function fetchCatalogueLeafNodes() {
  const query = '*[_type == "catalogueItem" && type == "link"]{_id, title, slug}';
  const leafNodes = await client.fetch(query);

  if (!Array.isArray(leafNodes)) {
    throw new Error('Invalid catalogue leaf nodes query result');
  }

  return leafNodes;
}

async function fetchProductTraits(productId) {
  const query = `*[_type == "product" && _id == $productId][0]{name, overviewFields}`;
  const product = await client.fetch(query, { productId });

  if (product && typeof product !== 'object') {
    throw new Error('Invalid product query result');
  }

  return product;
}

const semanticMap = {
  'desktop-amps': ['integrated amplifier', 'integrated amp'],
  'dac-amp-combos': ['d/a conversion', 'reference quality d/a conversion', 'hi-res d/a conversion'],
  'standalone-dacs': ['standalone dac', 'separate dac'],
  'portable-amps': ['portable amplifier', 'portable amp'],
  'network-streamers': ['network streamer', 'streaming device'],
  'digital-players-daps': ['digital audio player', 'dap'],
  'interconnects': ['rca cable', 'xlr cable'],
  'headphone-cables': ['headphone cable', 'detachable cable'],
  'adapters': ['adapter', 'adaptor'],
  'carrying-cases': ['carrying case', 'protective case'],
  'headphone-stands': ['headphone stand', 'display stand'],
  'earpads': ['earpad', 'ear pad'],
  'care-cleaning': ['cleaning kit', 'care solution'],
  'closed-back': ['closed back headphone'],
  'open-back': ['open back headphone'],
  'monitors-iems': ['in-ear monitor', 'iem'],
  'true-wireless-tws': ['true wireless'],
  'dynamic': ['dynamic driver'],
  'planar-magnetic': ['planar magnetic', 'planar driver'],
  'electrostatic': ['electrostatic headphone']
};

function determineLeafNodeIds(leafNodes, productTraits) {
  if (!productTraits) return [];

  const knowledgeString = [
    productTraits.name || '',
    ...(productTraits.overviewFields || [])
      .filter(field => field && typeof field.value === 'string')
      .map(field => field.value)
  ].join(' ').toLowerCase();

  const matchedIds = [];

  for (const leafNode of leafNodes) {
    const leafSlug = leafNode.slug?.current;
    if (!leafSlug) continue;

    const semanticKeywords = semanticMap[leafSlug] || [];
    const nodeText = `${leafNode.title} ${semanticKeywords.join(' ')}`.toLowerCase();

    const hasMatch = semanticKeywords.some(keyword =>
      knowledgeString.includes(keyword.toLowerCase())
    );

    if (hasMatch) {
      matchedIds.push(leafNode._id);
    }
  }

  return [...new Set(matchedIds)];
}

function logMissingProduct(productId, productName) {
  const missingFile = join(process.cwd(), 'scripts', 'product-vfs-mapper', 'missing-products.json');
  let missingProducts = [];

  try {
    const existing = require(missingFile);
    missingProducts = Array.isArray(existing) ? existing : [];
  } catch (error) {
    missingProducts = [];
  }

  const existingEntry = missingProducts.find(p => p.productId === productId);
  if (!existingEntry) {
    missingProducts.push({
      productId,
      productName: productName || 'Unknown',
      missingFields: ['overviewFields', 'specifications'],
      timestamp: new Date().toISOString()
    });

    writeFileSync(missingFile, JSON.stringify(missingProducts, null, 2));
    console.log(`Logged missing product: ${productId} - ${productName || 'Unknown'}`);
  }
}

async function resetAndPopulateCatalogueKeys(productId, determinedIds) {
  const transaction = client.transaction();

  transaction.patch(productId, (patch) => {
    return patch.unset(['catalogueLocationKeys']).set({
      catalogueLocationKeys: determinedIds
    });
  });

  await transaction.commit();
}

async function verifyAgainstDetermined(productId, determinedIds) {
  console.log(`Testing against determined IDs: ${JSON.stringify(determinedIds)}`);

  let passedTests = 0;
  let totalTests = 0;

  // Positive Leaf Tests
  console.log('\n--- Positive Leaf Tests ---');
  for (const leafId of determinedIds) {
    totalTests++;
    try {
      const leafQuery = `*[_type == "catalogueItem" && _id == $leafId][0]{title, slug}`;
      const leafNode = await client.fetch(leafQuery, { leafId });

      if (leafNode) {
        console.log(`✅ PASS: Determined leaf "${leafNode.title}" exists and is valid`);
        passedTests++;
      } else {
        console.log(`❌ FAIL: Determined leaf ${leafId} does not exist`);
      }
    } catch (error) {
      console.log(`❌ ERROR: Failed to verify leaf ${leafId}: ${error.message}`);
    }
  }

  // Negative Co-Branch Tests
  console.log('\n--- Negative Co-Branch Tests ---');
  const negativeTests = [
    { id: 'o7c6baiuobsr7ni2y2vf22sh', title: 'Open-Back' },
    { id: 'yd9641q8fiuh9rgoupauw2zl', title: 'Planar Magnetic' }
  ];

  for (const negativeTest of negativeTests) {
    totalTests++;
    const hasNegativeMatch = determinedIds.includes(negativeTest.id);

    if (!hasNegativeMatch) {
      console.log(`✅ PASS: Correctly NOT matched with "${negativeTest.title}"`);
      passedTests++;
    } else {
      console.log(`❌ FAIL: Incorrectly matched with "${negativeTest.title}"`);
    }
  }

  console.log(`\n=== Verification Results: ${passedTests}/${totalTests} passed ===`);
  console.log(passedTests === totalTests ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
}

async function logCatalogMapping(productId, determinedIds, productName) {
  const logFile = join(process.cwd(), 'catalog_temporary', 'catalog-mappings.md');

  // Fetch leaf node details for readable labels
  const leafDetails = [];
  for (const leafId of determinedIds) {
    const leafQuery = `*[_type == "catalogueItem" && _id == $leafId][0]{title, slug}`;
    const leaf = await client.fetch(leafQuery, { leafId });
    if (leaf) {
      leafDetails.push({
        id: leafId,
        title: leaf.title,
        slug: leaf.slug.current
      });
    }
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const entry = `## ${productName || 'Unknown Product'} (${productId}) - ${timestamp}\n\n` +
    `**Product:** ${productName || 'Unknown'}\n` +
    `**ID:** ${productId}\n\n` +
    `**Catalog Locations (${determinedIds.length}):**\n\n`;

  let locationsText = '';
  leafDetails.forEach((leaf, index) => {
    locationsText += `${index + 1}. **${leaf.title}** (${leaf.slug})\n` +
      `   - ID: \`${leaf.id}\`\n`;
  });

  const fullEntry = entry + locationsText + '\n---\n\n';

  // Append to file or create new file
  try {
    const existing = readFileSync(logFile, 'utf8');
    writeFileSync(logFile, existing + fullEntry);
  } catch (error) {
    writeFileSync(logFile, fullEntry);
  }

  console.log(`Catalog mapping logged to: catalog_temporary/catalog-mappings.md`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verifyDetermined = args.includes('--verify-determined');
  const productIdIndex = args.findIndex(arg => arg.startsWith('--productId='));
  const productId = productIdIndex !== -1 ? args[productIdIndex].split('=')[1] : null;

  if (!productId) {
    console.error('Error: --productId is required');
    process.exit(1);
  }

  try {
    const leafNodes = await fetchCatalogueLeafNodes();
    const productTraits = await fetchProductTraits(productId);
    const determinedIds = determineLeafNodeIds(leafNodes, productTraits);

    console.log('Matched leaf node IDs:', determinedIds);

    if (verifyDetermined) {
      console.log('\n=== Verification Against Determined Output ===');
      await verifyAgainstDetermined(productId, determinedIds);
      return;
    }

    if (!productTraits || !productTraits.overviewFields) {
      logMissingProduct(productId, productTraits?.name);
    }

    if (!dryRun && determinedIds.length > 0) {
      await resetAndPopulateCatalogueKeys(productId, determinedIds);
      console.log('Product catalogueLocationKeys updated successfully');
      await logCatalogMapping(productId, determinedIds, productTraits?.name);
    } else if (dryRun) {
      console.log('Dry run completed - no changes made');
      await logCatalogMapping(productId, determinedIds, productTraits?.name);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
