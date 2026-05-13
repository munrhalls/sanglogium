import { createClient } from "next-sanity";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join("=").trim();
  }
});

// Load environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = "production"; // Hardcoded for diagnostic - production dataset
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_STUDIO_READ_WRITE;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
}

if (!token) {
  throw new Error("SANITY_STUDIO_READ_WRITE is required");
}

// Create backend client
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// Fields that should NOT be present in CMS (intentionally deleted during migration)
const DELETED_FIELDS = ["categoryPath", "stripePriceId"];

// Query for products with non-empty catalogueLocationKeys
const query = `*[_type == "product"]`;

// Load migration JSON
const migrationJsonPath = join(__dirname, "migrations", "parcel-migration", "products-to-products-with-parcel-data.json");
const migrationData = JSON.parse(readFileSync(migrationJsonPath, "utf-8"));

// Create lookup map for JSON data
const jsonProductMap = new Map();
migrationData.products.forEach((product) => {
  jsonProductMap.set(product._id, product);
});

// Function to compare objects deeply
function deepCompare(obj1, obj2, path = "") {
  const differences = [];

  if (obj1 === obj2) return differences;

  if (typeof obj1 !== typeof obj2) {
    differences.push(`${path}: Type mismatch - ${typeof obj1} vs ${typeof obj2}`);
    return differences;
  }

  if (obj1 === null || obj2 === null) {
    if (obj1 !== obj2) {
      differences.push(`${path}: Null mismatch - ${obj1} vs ${obj2}`);
    }
    return differences;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      differences.push(`${path}: Array length mismatch - ${obj1.length} vs ${obj2.length}`);
    }
    const maxLength = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < maxLength; i++) {
      differences.push(...deepCompare(obj1[i], obj2[i], `${path}[${i}]`));
    }
    return differences;
  }

  if (typeof obj1 === "object" && typeof obj2 === "object") {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      if (!(key in obj1)) {
        differences.push(`${newPath}: Missing in JSON - key exists only in CMS`);
      } else if (!(key in obj2)) {
        differences.push(`${newPath}: Missing in CMS - key exists only in JSON`);
      } else {
        differences.push(...deepCompare(obj1[key], obj2[key], newPath));
      }
    }
    return differences;
  }

  if (obj1 !== obj2) {
    differences.push(`${path}: Value mismatch - "${obj1}" vs "${obj2}"`);
  }

  return differences;
}

// Main diagnostic function
async function runDiagnostics() {
  console.log("=== Product Migration Diagnostic Report ===\n");

  // Fetch all products with non-empty catalogueLocationKeys from CMS
  console.log("Fetching all products from CMS...");
  const cmsProducts = await client.fetch(query);
  console.log(`Found ${cmsProducts.length} total products in CMS\n`);

  // Filter to products with non-empty catalogueLocationKeys
  const productsWithCatalogueKeys = cmsProducts.filter(
    (p) => p.catalogueLocationKeys && p.catalogueLocationKeys.length > 0
  );
  console.log(`Found ${productsWithCatalogueKeys.length} products with non-empty catalogueLocationKeys\n`);

  const results = [];

  for (const cmsProduct of productsWithCatalogueKeys) {
    const productId = cmsProduct._id;
    console.log(`\n--- Checking Product: ${productId} ---`);

    const jsonProduct = jsonProductMap.get(productId);
    if (!jsonProduct) {
      console.log(`❌ Product not found in migration JSON`);
      results.push({
        productId,
        foundInJson: false,
        foundInCms: true,
        publicationStatus: cmsProduct._id.startsWith("drafts.") ? "DRAFT" : "PUBLISHED",
        hasDeletedFields: false,
        differences: ["Product not found in JSON"],
      });
      continue;
    }

    console.log(`✓ Found in migration JSON`);

    // Check publication status
    const publicationStatus = cmsProduct._id.startsWith("drafts.") ? "DRAFT" : "PUBLISHED";
    console.log(`📄 Publication Status: ${publicationStatus}`);

    // Check for deleted fields (should NOT be present in CMS)
    const deletedFieldsFound = [];
    DELETED_FIELDS.forEach((field) => {
      if (field in cmsProduct) {
        deletedFieldsFound.push(field);
      }
    });

    if (deletedFieldsFound.length > 0) {
      console.log(`❌ Found deleted fields in CMS: ${deletedFieldsFound.join(", ")}`);
    } else {
      console.log(`✓ No deleted fields present in CMS (correct)`);
    }

    // Compare data (excluding Sanity metadata fields and deleted fields)
    const jsonCopy = { ...jsonProduct };
    const cmsCopy = { ...cmsProduct };

    // Remove Sanity metadata fields that may differ
    const metadataFields = ["_createdAt", "_updatedAt", "_rev"];
    metadataFields.forEach((field) => {
      delete jsonCopy[field];
      delete cmsCopy[field];
    });

    // Remove deleted fields from comparison (they should not be in CMS)
    DELETED_FIELDS.forEach((field) => {
      delete cmsCopy[field];
      delete jsonCopy[field];
    });

    const differences = deepCompare(jsonCopy, cmsCopy);

    if (differences.length === 0) {
      console.log(`✓ Data matches perfectly`);
    } else {
      console.log(`⚠️  Found ${differences.length} differences:`);
      differences.slice(0, 10).forEach((diff) => console.log(`   - ${diff}`));
      if (differences.length > 10) {
        console.log(`   ... and ${differences.length - 10} more differences`);
      }
    }

    results.push({
      productId,
      foundInJson: true,
      foundInCms: true,
      publicationStatus,
      hasDeletedFields: deletedFieldsFound.length > 0,
      deletedFieldsFound,
      differences,
      differenceCount: differences.length,
    });
  }

  // Summary report
  console.log("\n\n=== Summary Report ===\n");
  console.log(`Total products with non-empty catalogueLocationKeys: ${productsWithCatalogueKeys.length}`);
  console.log(`Found in both JSON and CMS: ${results.filter((r) => r.foundInJson && r.foundInCms).length}`);
  console.log(`Published: ${results.filter((r) => r.publicationStatus === "PUBLISHED").length}`);
  console.log(`Draft: ${results.filter((r) => r.publicationStatus === "DRAFT").length}`);
  console.log(`Products with deleted fields present: ${results.filter((r) => r.hasDeletedFields).length}`);
  console.log(`Perfect matches (no deleted fields, no data differences): ${results.filter((r) => !r.hasDeletedFields && r.differenceCount === 0).length}`);

  console.log("\n--- Detailed Results ---");
  if (results.length <= 20) {
    results.forEach((result) => {
      console.log(`\nProduct ID: ${result.productId}`);
      console.log(`  Found in JSON: ${result.foundInJson ? "✓" : "❌"}`);
      console.log(`  Publication Status: ${result.publicationStatus}`);
      console.log(`  Deleted fields present: ${result.hasDeletedFields ? `❌ (${result.deletedFieldsFound.join(", ")})` : "✓ (none)"}`);
      console.log(`  Data differences: ${result.differenceCount}`);
    });
  } else {
    console.log(`(Skipping detailed results for ${results.length} products - showing summary only)`);
    const sampleSize = 5;
    console.log(`\n--- Sample Results (first ${sampleSize} products) ---`);
    results.slice(0, sampleSize).forEach((result) => {
      console.log(`\nProduct ID: ${result.productId}`);
      console.log(`  Found in JSON: ${result.foundInJson ? "✓" : "❌"}`);
      console.log(`  Publication Status: ${result.publicationStatus}`);
      console.log(`  Deleted fields present: ${result.hasDeletedFields ? `❌ (${result.deletedFieldsFound.join(", ")})` : "✓ (none)"}`);
      console.log(`  Data differences: ${result.differenceCount}`);
    });
  }

  // Final conclusion
  console.log("\n=== Conclusion ===");
  const hasIssues = results.some((r) => r.hasDeletedFields || r.differenceCount > 0);
  if (hasIssues) {
    console.log("❌ Issues found: Some products have deleted fields or data discrepancies.");
  } else {
    console.log("✓ All products match migration JSON exactly with no deleted fields present.");
  }
}

runDiagnostics().catch(console.error);
