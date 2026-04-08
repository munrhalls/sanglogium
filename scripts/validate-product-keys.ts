import { createClient } from "next-sanity";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: "2023-05-03",
});

interface OrphanedKey {
  key: string;
  productIds: string[];
}

async function validateProductKeys() {
  console.log("🔍 Validating Product VFS Keys...");

  try {
    // Load catalogue index
    const indexPath = path.join(process.cwd(), "data", "catalogue-index.json");
    const indexContent = await fs.readFile(indexPath, "utf-8");
    const index = JSON.parse(indexContent);

    // Extract all valid VFS IDs from slotMetadataMap
    const allValidIds = new Set(Object.keys(index.slotMetadataMap));
    console.log(`   Loaded ${allValidIds.size} valid VFS slots`);

    // Query all products with their catalogueLocationKeys
    const products = await client.fetch(`*[_type == "product"][]{ 
      _id, 
      name,
      "keys": catalogueLocationKeys
    }`);

    console.log(`   Checking ${products.length} products...`);

    // Collect orphaned keys
    const orphanedKeys = new Map<string, string[]>();

    for (const product of products) {
      if (!product.keys || !Array.isArray(product.keys)) continue;

      for (const key of product.keys) {
        if (!allValidIds.has(key)) {
          if (!orphanedKeys.has(key)) {
            orphanedKeys.set(key, []);
          }
          orphanedKeys.get(key)!.push(product._id);
        }
      }
    }

    // Report results
    if (orphanedKeys.size > 0) {
      console.log(`\n❌ VALIDATION FAILED - Found ${orphanedKeys.size} orphaned keys:`);
      
      const tableData: OrphanedKey[] = [];
      for (const [key, productIds] of orphanedKeys) {
        tableData.push({ key, productIds });
        console.log(`   - "${key}" referenced by ${productIds.length} product(s)`);
      }

      console.table(tableData);
      
      // Fail build unless --warn-only flag is set
      if (process.argv.includes("--warn-only")) {
        console.log("\n⚠️  Warning mode: continuing despite orphaned keys");
        return;
      }
      
      throw new Error(`${orphanedKeys.size} orphaned catalogueLocationKeys found`);
    } else {
      console.log(`✅ VALIDATION PASSED - All ${products.length} products have valid VFS keys`);
    }

  } catch (error) {
    console.error("❌ Validation Failed:", error);
    process.exit(1);
  }
}

validateProductKeys();
