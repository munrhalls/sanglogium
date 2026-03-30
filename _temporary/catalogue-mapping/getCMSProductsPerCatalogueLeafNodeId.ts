/**
 * Get CMS Products Per Catalogue Leaf Node ID
 *
 * For each leaf node ID from CMS-catalogue-structure.json,
 * runs GROQ that fetches products via catalogueLocationKeys array containing the leaf node ID.
 *
 * Expected result: 0 per every single leaf node at current step.
 */

import { sanityFetch } from "../../sanity/lib/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface CatalogueNode {
  id: string;
  title: string;
  type: "header" | "link";
  path: string;
  slug: string | null;
  sortOrder: number;
  icon: string | null;
  children?: CatalogueNode[];
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
  structure: CatalogueNode[];
  flat: Array<{
    id: string;
    title: string;
    type: "header" | "link";
    slug: string | null;
    icon: string | null;
    sortOrder: number;
    parentId: string | null;
  }>;
}

interface ProductResult {
  _id: string;
  name: string;
  catalogueLocationKeys: string[];
}

interface LeafNodeProductCount {
  leafNodeId: string;
  leafNodeTitle: string;
  leafNodePath: string;
  productCount: number;
  products: ProductResult[];
}

// Load CMS catalogue structure
const structurePath = path.join(__dirname, "CMS-catalogue-structure.json");
const structure: CMSCatalogueStructure = JSON.parse(
  fs.readFileSync(structurePath, "utf-8")
);

/**
 * Extract all leaf node IDs from the catalogue structure
 * Leaf nodes are "link" type nodes (not "header" type)
 */
function extractLeafNodeIds(nodes: CatalogueNode[]): Array<{
  id: string;
  title: string;
  path: string;
}> {
  const leafNodes: Array<{ id: string; title: string; path: string }> = [];

  for (const node of nodes) {
    if (node.type === "link") {
      leafNodes.push({
        id: node.id,
        title: node.title,
        path: node.path,
      });
    }
    if (node.children && node.children.length > 0) {
      leafNodes.push(...extractLeafNodeIds(node.children));
    }
  }

  return leafNodes;
}

/**
 * GROQ query to fetch products by catalogue location key
 */
const PRODUCTS_BY_LOCATION_KEY_GROQ = `
  *[_type == "product" && $leafNodeId in catalogueLocationKeys] {
    _id,
    name,
    catalogueLocationKeys
  }
`;

/**
 * Fetch products for a single leaf node ID
 */
async function getProductsForLeafNode(
  leafNodeId: string,
  leafNodeTitle: string,
  leafNodePath: string
): Promise<LeafNodeProductCount> {
  const products = await sanityFetch<ProductResult[]>({
    query: PRODUCTS_BY_LOCATION_KEY_GROQ,
    params: { leafNodeId },
  });

  return {
    leafNodeId,
    leafNodeTitle,
    leafNodePath,
    productCount: products.length,
    products,
  };
}

/**
 * Main function: Get CMS products per catalogue leaf node ID
 *
 * Expected result: 0 per every single leaf node at current step
 */
export async function getCMSProductsPerCatalogueLeafNodeId(): Promise<{
  results: LeafNodeProductCount[];
  summary: {
    totalLeafNodes: number;
    leafNodesWithProducts: number;
    leafNodesWithZeroProducts: number;
    totalProductsFound: number;
  };
}> {
  const leafNodes = extractLeafNodeIds(structure.structure);
  const results: LeafNodeProductCount[] = [];

  console.log(`Checking ${leafNodes.length} leaf nodes...`);

  for (const leafNode of leafNodes) {
    const result = await getProductsForLeafNode(
      leafNode.id,
      leafNode.title,
      leafNode.path
    );
    results.push(result);

    console.log(
      `[${result.productCount}] ${leafNode.title} (${leafNode.path}) - ID: ${leafNode.id}`
    );
  }

  const summary = {
    totalLeafNodes: leafNodes.length,
    leafNodesWithProducts: results.filter((r) => r.productCount > 0).length,
    leafNodesWithZeroProducts: results.filter((r) => r.productCount === 0)
      .length,
    totalProductsFound: results.reduce((sum, r) => sum + r.productCount, 0),
  };

  console.log("\n--- Summary ---");
  console.log(`Total leaf nodes: ${summary.totalLeafNodes}`);
  console.log(`Leaf nodes with products: ${summary.leafNodesWithProducts}`);
  console.log(
    `Leaf nodes with zero products: ${summary.leafNodesWithZeroProducts}`
  );
  console.log(`Total products found: ${summary.totalProductsFound}`);

  return { results, summary };
}

// Run directly if executed as script
console.log("Script starting...");
getCMSProductsPerCatalogueLeafNodeId()
  .then((result) => {
    console.log("\n=== FINAL RESULTS ===");
    console.log(JSON.stringify(result, null, 2));

    // Write results to file
    const outputPath = path.join(__dirname, "products-per-leaf-node-CMS-fetch.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nResults saved to: ${outputPath}`);

    console.log("\nDone.");
  })
  .catch((err) => {
    console.error("Error:", err);
  });
