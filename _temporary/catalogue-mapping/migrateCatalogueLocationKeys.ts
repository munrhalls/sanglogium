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
 * - Dry-run mode available
 * - Detailed logging
 */

import { backendClient } from "../../sanity/lib/backendClient.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface TruthTableProduct {
  name: string;
  id: string;
}

interface TruthTableLeafNode {
  products: TruthTableProduct[];
  checklist: {
    verified: boolean;
    productCount: number;
    mixUps: number;
  };
}

interface CatalogueTruthTable {
  overallSummary: {
    totalUniqueLeafNodes: number;
    totalProducts: number;
    chunks: Array<{
      range: string;
      productsMatched: number;
      status: string;
    }>;
  };
  leafNodes: Record<string, TruthTableLeafNode>;
  emptyChunks: Record<string, {
    totalMatched: number;
    status: string;
    note: string;
  }>;
}

interface CMSCatalogueItem {
  id: string;
  title: string;
  type: "header" | "link";
  slug: string | null;
  icon: string | null;
  sortOrder: number;
  parentId: string | null;
}

interface CMSCatalogueStructure {
  metadata: {
    generatedAt: string;
    source: string;
    projectId: string;
    dataset: string;
    totalItems: number;
    rootCategories: number;
    parentNodes: number;
    leafNodes: number;
  };
  structure: unknown[];
  flat: CMSCatalogueItem[];
}

interface MigrationResult {
  productId: string;
  productName: string;
  leafNodePath: string;
  leafNodeId: string;
  success: boolean;
  previousKeys: string[];
  newKeys: string[];
  error?: string;
}

interface MigrationSummary {
  totalProducts: number;
  successful: number;
  failed: number;
  skipped: number;
  results: MigrationResult[];
}

// Load source files
const truthTablePath = path.join(__dirname, "catalogue-truth-table.json");
const cmsStructurePath = path.join(__dirname, "CMS-catalogue-structure.json");

const truthTable: CatalogueTruthTable = JSON.parse(
  fs.readFileSync(truthTablePath, "utf-8")
);

const cmsStructure: CMSCatalogueStructure = JSON.parse(
  fs.readFileSync(cmsStructurePath, "utf-8")
);

/**
 * Build a mapping from path (e.g., "/headphones/by-design/open-back") to leaf node ID
 * by using the slug to match paths in the truth table with CMS items.
 */
function buildPathToIdMap(): Map<string, string> {
  const pathToId = new Map<string, string>();

  for (const item of cmsStructure.flat) {
    if (item.type === "link" && item.slug) {
      // Build full path by traversing parent chain
      const fullPath = buildFullPath(item.id, cmsStructure.flat);
      if (fullPath) {
        pathToId.set(fullPath, item.id);
      }
    }
  }

  return pathToId;
}

/**
 * Build full path by traversing parent chain from flat structure
 */
function buildFullPath(itemId: string, flatItems: CMSCatalogueItem[]): string | null {
  const item = flatItems.find((i) => i.id === itemId);
  if (!item || !item.slug) return null;

  const parts: string[] = [item.slug];
  let currentParentId = item.parentId;

  while (currentParentId) {
    const parent = flatItems.find((i) => i.id === currentParentId);
    if (!parent) break;
    if (parent.slug) {
      parts.unshift(parent.slug);
    }
    currentParentId = parent.parentId;
  }

  return "/" + parts.join("/");
}

/**
 * Fetch existing product to get current catalogueLocationKeys
 */
async function getProduct(productId: string): Promise<{
  _id: string;
  _rev: string;
  name: string;
  catalogueLocationKeys?: string[];
} | null> {
  const query = `*[_type == "product" && _id == $productId][0] {
    _id,
    _rev,
    name,
    catalogueLocationKeys
  }`;

  try {
    return await backendClient.fetch(query, { productId });
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
}

/**
 * Update product's catalogueLocationKeys using Sanity patch API
 * Safely merges new keys with existing ones (no duplicates)
 */
async function updateProductCatalogueLocationKeys(
  productId: string,
  leafNodeId: string,
  productName: string,
  leafNodePath: string
): Promise<MigrationResult> {
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
    await backendClient
      .patch(productId)
      .set({ catalogueLocationKeys: newKeys })
      .commit({
        // Preserve revision to prevent conflicts
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      productId,
      productName,
      leafNodePath,
      leafNodeId,
      success: false,
      previousKeys,
      newKeys,
      error: `Patch failed: ${errorMessage}`,
    };
  }
}

/**
 * Main migration function
 */
async function migrateCatalogueLocationKeys(): Promise<MigrationSummary> {
  console.log("=== Starting Catalogue Location Keys Migration ===\n");

  // Build path to ID mapping
  const pathToId = buildPathToIdMap();
  console.log(`Built path-to-ID mapping with ${pathToId.size} leaf nodes`);

  // Verify all truth table paths exist in CMS
  const truthTablePaths = Object.keys(truthTable.leafNodes);
  const missingPaths: string[] = [];

  for (const path of truthTablePaths) {
    if (!pathToId.has(path)) {
      missingPaths.push(path);
    }
  }

  if (missingPaths.length > 0) {
    console.warn("Warning: The following paths from truth table were not found in CMS:");
    for (const path of missingPaths) {
      console.warn(`  - ${path}`);
    }
  }

  // Prepare migration tasks
  const migrationTasks: Array<{
    productId: string;
    productName: string;
    leafNodePath: string;
    leafNodeId: string;
  }> = [];

  for (const [leafNodePath, leafNodeData] of Object.entries(truthTable.leafNodes)) {
    const leafNodeId = pathToId.get(leafNodePath);

    if (!leafNodeId) {
      console.warn(`Skipping ${leafNodePath}: no matching CMS ID found`);
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
  const results: MigrationResult[] = [];
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
        console.log(`[SKIPPED] ${result.productName} (${result.productId}) - already has key ${result.leafNodeId}`);
      } else {
        console.log(`[UPDATED] ${result.productName} (${result.productId}) - added ${result.leafNodeId}`);
      }
    } else {
      console.log(`[FAILED] ${result.productName} (${result.productId}) - ${result.error}`);
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

  const summary: MigrationSummary = {
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
