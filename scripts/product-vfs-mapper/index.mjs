#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { writeFileSync } from 'fs';
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
  return leafNodes;
}

async function fetchProductTraits(productId) {
  const query = `*[_type == "product" && _id == $productId][0]{name, overviewFields}`;
  const product = await client.fetch(query, { productId });
  return product;
}

function determineLeafNodeIds(leafNodes, productTraits) {
  if (!productTraits || !productTraits.overviewFields) return [];

  const traits = Object.values(productTraits.overviewFields).flat().filter(Boolean);
  const matchedIds = [];

  for (const leafNode of leafNodes) {
    const nodeText = `${leafNode.title} ${leafNode.slug?.current || ''}`.toLowerCase();

    for (const trait of traits) {
      const traitText = String(trait).toLowerCase();
      if (nodeText.includes(traitText) || traitText.includes(nodeText.split('(')[0].trim())) {
        matchedIds.push(leafNode._id);
        break;
      }
    }
  }

  return matchedIds;
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

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
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

    if (!productTraits || !productTraits.overviewFields) {
      logMissingProduct(productId, productTraits?.name);
    }

    if (!dryRun && determinedIds.length > 0) {
      await resetAndPopulateCatalogueKeys(productId, determinedIds);
      console.log('Product catalogueLocationKeys updated successfully');
    } else if (dryRun) {
      console.log('Dry run completed - no changes made');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
