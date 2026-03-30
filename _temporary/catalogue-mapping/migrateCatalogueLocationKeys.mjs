/**
 * Migration Script: Update Product Catalogue Location Keys
 *
 * Uses catalogue-truth-table.json to update each product's catalogueLocationKeys
 * with the corresponding leaf node ID from CMS-catalogue-structure.json.
 *
 * Safety features:
 * - Uses Sanity patch API (only updates catalogueLocationKeys, preserves all other data)
 * - Validates product exists before patching
 * - Merges new keys with existing ones (no duplicates)
 * - Detailed logging
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import client from "../../sanity/utils/getClient.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load source files
const truthTablePath = path.join(__dirname, "catalogue-truth-table.json");
const cmsStructurePath = path.join(__dirname, "CMS-catalogue-structure.json");

const truthTable = JSON.parse(fs.readFileSync(truthTablePath, "utf-8"));
const cmsStructure = JSON.parse(fs.readFileSync(cmsStructurePath, "utf-8"));

/**
 * Build a mapping from path (e.g., "/headphones/by-design/open-back") to leaf node ID
 * using the CMS path field directly.
 */
function buildPathToIdMap() {
  const pathToId = new Map();

  // Extract all leaf nodes from the nested structure
  function extractLeafNodes(nodes) {
    for (const node of nodes) {
      if (node.type === "link" && node.path) {
        // CMS path is like "headphones/by-design/open-back"
        // Truth table path is like "/headphones/by-design/open-back"
        const fullPath = "/" + node.path;
        pathToId.set(fullPath, node.id);
      }
      if (node.children && node.children.length > 0) {
        extractLeafNodes(node.children);
      }
    }
  }

  extractLeafNodes(cmsStructure.structure);

  return pathToId;
}

/**
 * Fetch existing product to get current catalogueLocationKeys
 */
async function getProduct(productId) {
  const query = `*[_type == "product" && _id == $productId][0] {
    _id,
    _rev,
    name,
    catalogueLocationKeys
  }`;

  try {
    return await client.fetch(query, { productId });
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error.message);
    return null;
  }
}

/**
 * Update product's catalogueLocationKeys using Sanity patch API
 */
async function updateProductCatalogueLocationKeys(
  productId,
  leafNodeId,
  productName,
  leafNodePath
) {
  const product = await getProduct(productId);

  if (!product) {
    return {
      productId,
      productName,
      leafNodePath,
      leafNodeId,
      success: false,
      previousKeys: [],
      newKeys: [],
      error: "Product not found in CMS",
    };
  }

  const previousKeys = product.catalogueLocationKeys || [];

  // Skip if key already exists
  if (previousKeys.includes(leafNodeId)) {
    return {
      productId,
      productName,
      leafNodePath,
      leafNodeId,
      success: true,
      previousKeys,
      newKeys: previousKeys,
    };
  }

  // Merge new key with existing ones
  const newKeys = [...previousKeys, leafNodeId];

  try {
    // Use patch API to only update catalogueLocationKeys
    await client
      .patch(productId)
      .set({ catalogueLocationKeys: newKeys })
      .commit({
        ifRevisionID: product._rev,
      });

    return {
      productId,
      productName,
      leafNodePath,
      leafNodeId,
      success: true,
      previousKeys,
      newKeys,
    };
  } catch (error) {
    return {
      productId,
      productName,
      leafNodePath,
      leafNodeId,
      success: false,
      previousKeys,
      newKeys,
      error: `Patch failed: ${error.message}`,
    };
  }
}

/**
 * Main migration function
 */
async function migrateCatalogueLocationKeys() {
  console.log("=== Starting Catalogue Location Keys Migration ===\n");

  // Build path to ID mapping
  const pathToId = buildPathToIdMap();
  console.log(`Built path-to-ID mapping with ${pathToId.size} leaf nodes`);

  // Verify all truth table paths exist in CMS
  const truthTablePaths = Object.keys(truthTable.leafNodes);
  const missingPaths = [];

  for (const path of truthTablePaths) {
    if (!pathToId.has(path)) {
      missingPaths.push(path);
    }
  }

  if (missingPaths.length > 0) {
    console.warn("\nWarning: The following paths from truth table were not found in CMS:");
    for (const p of missingPaths) {
      console.warn(`  - ${p}`);
    }
  }

  // Prepare migration tasks
  const migrationTasks = [];

  for (const [leafNodePath, leafNodeData] of Object.entries(truthTable.leafNodes)) {
    const leafNodeId = pathToId.get(leafNodePath);

    if (!leafNodeId) {
      console.warn(`\nSkipping ${leafNodePath}: no matching CMS ID found`);
      continue;
    }

    for (const product of leafNodeData.products) {
      migrationTasks.push({
        productId: product.id,
        productName: product.name,
        leafNodePath,
        leafNodeId,
      });
    }
  }

  console.log(`\nPrepared ${migrationTasks.length} migration tasks\n`);

  // Execute migrations
  const results = [];
  let processed = 0;

  for (const task of migrationTasks) {
    const result = await updateProductCatalogueLocationKeys(
      task.productId,
      task.leafNodeId,
      task.productName,
      task.leafNodePath
    );

    results.push(result);
    processed++;

    if (result.success) {
      if (result.previousKeys.length === result.newKeys.length) {
        console.log(`[SKIPPED] ${result.productName.substring(0, 60)} - already has key`);
      } else {
        console.log(`[UPDATED] ${result.productName.substring(0, 60)} - added ${result.leafNodeId.substring(0, 20)}...`);
      }
    } else {
      console.log(`[FAILED] ${result.productName.substring(0, 60)} - ${result.error}`);
    }

    // Progress indicator every 50 items
    if (processed % 50 === 0) {
      console.log(`\n--- Progress: ${processed}/${migrationTasks.length} ---\n`);
    }
  }

  // Calculate summary
  const successful = results.filter((r) => r.success && r.previousKeys.length !== r.newKeys.length).length;
  const skipped = results.filter((r) => r.success && r.previousKeys.length === r.newKeys.length).length;
  const failed = results.filter((r) => !r.success).length;

  const summary = {
    totalProducts: migrationTasks.length,
    successful,
    failed,
    skipped,
    results,
  };

  // Save detailed results
  const resultsPath = path.join(__dirname, "migration-results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));
  console.log(`\nDetailed results saved to: ${resultsPath}`);

  // Print summary
  console.log("\n=== Migration Summary ===");
  console.log(`Total products processed: ${summary.totalProducts}`);
  console.log(`Successfully updated: ${summary.successful}`);
  console.log(`Skipped (already had key): ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);

  return summary;
}

// Run migration
console.log("Script starting...");
migrateCatalogueLocationKeys()
  .then((summary) => {
    console.log("\nMigration complete.");
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
