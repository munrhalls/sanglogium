#!/usr/bin/env node
/**
 * Fetch Catalogue Structure from Sanity CMS
 *
 * Downloads all catalogueItem documents and assembles them into
 * a hierarchical JSON structure with IDs for all nodes.
 */

import { createClient } from "next-sanity";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

// Get env vars
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

if (!PROJECT_ID || !DATASET) {
  console.error("Missing required environment variables:");
  if (!PROJECT_ID) console.error("  - NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (!DATASET) console.error("  - NEXT_PUBLIC_SANITY_DATASET");
  process.exit(1);
}

// Initialize Sanity client (same config as sanity/lib/client.ts)
const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: true,
  perspective: "published",
});

// GROQ query to fetch all catalogue items with parent info
const CATALOGUE_QUERY = `*[_type == "catalogueItem"] | order(sortOrder asc, title asc) {
  _id,
  title,
  type,
  "slug": slug.current,
  icon,
  sortOrder,
  "parentId": parent._ref
}`;

// ============================================================================
// BUILD TREE STRUCTURE
// ============================================================================

function buildCatalogueTree(items) {
  // Create lookup map
  const itemMap = new Map();
  for (const item of items) {
    itemMap.set(item._id, {
      id: item._id,
      title: item.title,
      type: item.type,
      slug: item.slug,
      icon: item.icon,
      sortOrder: item.sortOrder,
      parentId: item.parentId,
      children: []
    });
  }

  // Build parent-child relationships
  const rootNodes = [];

  for (const item of itemMap.values()) {
    if (item.parentId && itemMap.has(item.parentId)) {
      // Add as child to parent
      const parent = itemMap.get(item.parentId);
      parent.children.push(item);
    } else {
      // Root node (no parent or parent not found)
      rootNodes.push(item);
    }
  }

  // Sort children by sortOrder, then title
  for (const item of itemMap.values()) {
    item.children.sort((a, b) => {
      const orderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
      if (orderDiff !== 0) return orderDiff;
      return a.title.localeCompare(b.title);
    });
  }

  // Sort root nodes
  rootNodes.sort((a, b) => {
    const orderDiff = (a.sortOrder || 0) - (b.sortOrder || 0);
    if (orderDiff !== 0) return orderDiff;
    return a.title.localeCompare(b.title);
  });

  return rootNodes;
}

// ============================================================================
// CONVERT TO CLEAN JSON OUTPUT
// ============================================================================

function formatNode(node, pathPrefix = "") {
  const currentPath = pathPrefix
    ? `${pathPrefix}/${node.slug || node.title.toLowerCase().replace(/\s+/g, "-")}`
    : (node.slug || node.title.toLowerCase().replace(/\s+/g, "-"));

  const formatted = {
    id: node.id,
    title: node.title,
    type: node.type,
    path: currentPath,
    slug: node.slug,
    sortOrder: node.sortOrder,
    icon: node.icon
  };

  if (node.children.length > 0) {
    formatted.children = node.children.map(child => formatNode(child, currentPath));
  }

  return formatted;
}

function formatTreeForOutput(rootNodes) {
  return rootNodes.map(node => formatNode(node, ""));
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("=" .repeat(70));
  console.log("FETCHING CATALOGUE STRUCTURE FROM SANITY");
  console.log("=" .repeat(70));
  console.log();
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Dataset: ${DATASET}`);
  console.log();

  try {
    // Step 1: Fetch catalogue items
    console.log("[1/3] Fetching catalogue items from Sanity...");
    const items = await client.fetch(CATALOGUE_QUERY);
    console.log(`      Found ${items.length} catalogue items`);
    console.log();

    // Step 2: Build tree structure
    console.log("[2/3] Building hierarchical tree...");
    const tree = buildCatalogueTree(items);

    // Count stats
    let leafCount = 0;
    let parentCount = 0;
    const countNodes = (nodes) => {
      for (const node of nodes) {
        if (node.children.length > 0) {
          parentCount++;
          countNodes(node.children);
        } else {
          leafCount++;
        }
      }
    };
    countNodes(tree);

    console.log(`      Root categories: ${tree.length}`);
    console.log(`      Parent nodes: ${parentCount}`);
    console.log(`      Leaf nodes: ${leafCount}`);
    console.log(`      Total nodes: ${items.length}`);
    console.log();

    // Step 3: Format and save
    console.log("[3/3] Saving to JSON file...");
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        source: "Sanity CMS",
        projectId: PROJECT_ID,
        dataset: DATASET,
        totalItems: items.length,
        rootCategories: tree.length,
        parentNodes: parentCount,
        leafNodes: leafCount
      },
      structure: formatTreeForOutput(tree),
      flat: items.map(item => ({
        id: item._id,
        title: item.title,
        type: item.type,
        slug: item.slug,
        icon: item.icon,
        sortOrder: item.sortOrder,
        parentId: item.parentId
      }))
    };

    const outputDir = "c:/webdev/sang-logium/_temporary/catalogue-mapping";
    const outputPath = path.join(outputDir, "CMS-catalogue-structure.json");

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");
    console.log(`      ✓ Written to: ${outputPath}`);
    console.log();

    console.log("=" .repeat(70));
    console.log("COMPLETE");
    console.log("=" .repeat(70));
    console.log();
    console.log("Output files:");
    console.log(`  - ${outputPath}`);
    console.log();
    console.log("The JSON contains:");
    console.log("  - metadata: generation info and counts");
    console.log("  - structure: hierarchical tree with IDs for all nodes");
    console.log("  - flat: flat list of all items with parent references");
    console.log();

    process.exit(0);
  } catch (error) {
    console.error("ERROR:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
