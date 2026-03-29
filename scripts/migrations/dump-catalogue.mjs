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

const CATALOGUE_QUERY = `
*[_type == "catalogueItem"] | order(sortOrder asc) {
  _id,
  title,
  type,
  slug,
  icon,
  parent->{
    _id,
    title
  }
}`;

// Transform flat Sanity data to exact legacy JSON structure (copied from getCatalogueData.ts)
function transformSanityToLegacyJson(items) {
  // Create a map for quick lookup
  const itemMap = new Map(items.map(item => [item._id, item]));

  // Find root items (no parent)
  const rootItems = items.filter(item => !item.parent);

  // Build recursive tree structure matching legacy JSON format
  const catalogue = rootItems.map(rootItem => {
    return buildLegacyCatalogueItem(rootItem, items, itemMap);
  });

  return { catalogue };
}

function buildLegacyCatalogueItem(item, allItems, itemMap) {
  // Find direct children - the parent reference uses _id not _ref
  const children = allItems.filter(child =>
    child.parent && child.parent._id === item._id
  );

  // Build children array recursively
  const childrenArray = children.map(child => {
    return buildLegacyCatalogueItem(child, allItems, itemMap);
  });

  // Return exact legacy structure
  const legacyItem = {
    id: item.slug?.current || item.title?.toLowerCase().replace(/\s+/g, '-') || item._id,
    title: item.title,
    type: item.type,
  };

  // Add slug if present (for link types)
  if (item.slug) {
    legacyItem.slug = {
      current: item.slug.current,
      _type: "slug"
    };
  }

  // Add icon if present (for root items)
  if (item.icon) {
    legacyItem.icon = item.icon;
  }

  // Add children if any exist
  if (childrenArray.length > 0) {
    legacyItem.children = childrenArray;
  }

  return legacyItem;
}

async function dumpCatalogueData() {
  console.log('Fetching catalogue data from Sanity CMS...');
  
  try {
    const sanityItems = await client.fetch(CATALOGUE_QUERY);
    console.log(`Found ${sanityItems.length} catalogue items`);
    
    const result = transformSanityToLegacyJson(sanityItems);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const content = `# Catalogue Data for UI - ${timestamp}\n\n` +
      `Total Items: ${sanityItems.length}\n` +
      `Root Categories: ${result.catalogue.length}\n\n` +
      `## Final UI Catalogue Structure\n\n` +
      '```json\n' +
      JSON.stringify(result, null, 2) +
      '\n```\n\n';
    
    const outputFile = join(process.cwd(), 'catalog_temporary', 'catalogue-data.md');
    writeFileSync(outputFile, content);
    
    console.log(`Catalogue data dumped to: catalog_temporary/catalogue-data.md`);
    console.log(`Structure contains ${result.catalogue.length} root categories`);
    
    // Log summary of root categories
    console.log('\nRoot Categories:');
    result.catalogue.forEach((category, index) => {
      console.log(`${index + 1}. ${category.title} (${category.type})`);
    });
    
  } catch (error) {
    console.error('Error fetching catalogue data:', error.message);
    process.exit(1);
  }
}

dumpCatalogueData();
