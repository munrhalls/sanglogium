import { createClient } from "next-sanity";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-05-03",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Need write token
});

/**
 * Mapping of category titles to VFS slot IDs
 * This map needs to be maintained as the catalogue structure changes
 */
const CATEGORY_TO_VFS_KEY_MAP = {
  // Headphones branch
  "Headphones": "ugyeto8653n495dpf89nzoar",
  "Headphones & Personal Audio": "ugyeto8653n495dpf89nzoar",
  
  // Audio Electronics branch  
  "Audio Electronics": "ti2wufd15h51jxtq855ogbfa",
  
  // Accessories branch
  "Accessories": "j9ozs17mc0b1nv2gqn2rvmg1",
  
  // Add more mappings as needed based on your filter/sortable document titles
};

/**
 * Migrate categoryFilters documents to add categoryKey field
 */
async function migrateCategoryFilters() {
  console.log("\n📋 Migrating categoryFilters documents...\n");

  try {
    // Fetch all categoryFilters documents
    const query = `*[_type == "categoryFilters" && !defined(categoryKey)]{_id, title, _rev}`;
    const documents = await client.fetch(query);

    if (!documents || documents.length === 0) {
      console.log("✅ No categoryFilters documents need migration (all have categoryKey)");
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    console.log(`Found ${documents.length} categoryFilters documents to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of documents) {
      const vfsKey = CATEGORY_TO_VFS_KEY_MAP[doc.title];
      
      if (!vfsKey) {
        console.log(`⚠️  No VFS key mapping for "${doc.title}" (${doc._id}) - skipping`);
        skipped++;
        continue;
      }

      try {
        // Update document with categoryKey
        await client
          .patch(doc._id)
          .set({ categoryKey: vfsKey })
          .ifRevisionId(doc._rev)
          .commit();

        console.log(`✅ Migrated: "${doc.title}" → ${vfsKey}`);
        migrated++;
      } catch (err) {
        console.error(`❌ Error migrating "${doc.title}" (${doc._id}):`, err.message);
        errors++;
      }
    }

    return { migrated, skipped, errors };
  } catch (err) {
    console.error("❌ Error fetching categoryFilters documents:", err.message);
    return { migrated: 0, skipped: 0, errors: 1 };
  }
}

/**
 * Migrate categorySortables documents to add categoryKey field
 */
async function migrateCategorySortables() {
  console.log("\n📋 Migrating categorySortables documents...\n");

  try {
    // Fetch all categorySortables documents
    const query = `*[_type == "categorySortables" && !defined(categoryKey)]{_id, title, _rev}`;
    const documents = await client.fetch(query);

    if (!documents || documents.length === 0) {
      console.log("✅ No categorySortables documents need migration (all have categoryKey)");
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    console.log(`Found ${documents.length} categorySortables documents to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of documents) {
      const vfsKey = CATEGORY_TO_VFS_KEY_MAP[doc.title];
      
      if (!vfsKey) {
        console.log(`⚠️  No VFS key mapping for "${doc.title}" (${doc._id}) - skipping`);
        skipped++;
        continue;
      }

      try {
        // Update document with categoryKey
        await client
          .patch(doc._id)
          .set({ categoryKey: vfsKey })
          .ifRevisionId(doc._rev)
          .commit();

        console.log(`✅ Migrated: "${doc.title}" → ${vfsKey}`);
        migrated++;
      } catch (err) {
        console.error(`❌ Error migrating "${doc.title}" (${doc._id}):`, err.message);
        errors++;
      }
    }

    return { migrated, skipped, errors };
  } catch (err) {
    console.error("❌ Error fetching categorySortables documents:", err.message);
    return { migrated: 0, skipped: 0, errors: 1 };
  }
}

/**
 * Generate report of current document state
 */
async function generateReport() {
  console.log("\n📊 Migration Report\n");
  console.log("====================\n");

  try {
    // Check categoryFilters
    const filtersTotal = await client.fetch(`count(*[_type == "categoryFilters"])`);
    const filtersWithKey = await client.fetch(`count(*[_type == "categoryFilters" && defined(categoryKey)])`);
    const filtersWithoutKey = await client.fetch(`count(*[_type == "categoryFilters" && !defined(categoryKey)])`);

    console.log("categoryFilters:");
    console.log(`  Total: ${filtersTotal}`);
    console.log(`  With categoryKey: ${filtersWithKey}`);
    console.log(`  Without categoryKey: ${filtersWithoutKey}`);

    // Check categorySortables
    const sortablesTotal = await client.fetch(`count(*[_type == "categorySortables"])`);
    const sortablesWithKey = await client.fetch(`count(*[_type == "categorySortables" && defined(categoryKey)])`);
    const sortablesWithoutKey = await client.fetch(`count(*[_type == "categorySortables" && !defined(categoryKey)])`);

    console.log("\ncategorySortables:");
    console.log(`  Total: ${sortablesTotal}`);
    console.log(`  With categoryKey: ${sortablesWithKey}`);
    console.log(`  Without categoryKey: ${sortablesWithoutKey}`);

    return {
      filters: { total: filtersTotal, withKey: filtersWithKey, withoutKey: filtersWithoutKey },
      sortables: { total: sortablesTotal, withKey: sortablesWithKey, withoutKey: sortablesWithoutKey },
    };
  } catch (err) {
    console.error("❌ Error generating report:", err.message);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log("\n🔧 VFS Category Key Migration Tool\n");
  console.log("===================================\n");

  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET) {
    console.error("❌ Missing Sanity configuration. Please check your .env file.");
    process.exit(1);
  }

  if (!process.env.SANITY_API_TOKEN) {
    console.error("❌ Missing SANITY_API_TOKEN environment variable (need write access).");
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || args.includes("-d");
  const reportOnly = args.includes("--report") || args.includes("-r");

  if (reportOnly) {
    await generateReport();
    return;
  }

  // Generate pre-migration report
  console.log("Pre-migration state:");
  const preState = await generateReport();

  if (dryRun) {
    console.log("\n🔍 DRY RUN MODE - No changes will be made\n");
    return;
  }

  // Confirm before proceeding
  if (!args.includes("--force") && !args.includes("-f")) {
    console.log("\n⚠️  This will modify documents in Sanity.");
    console.log("   Use --force or -f to proceed without confirmation.\n");
    
    const confirmed = await new Promise((resolve) => {
      process.stdout.write("Proceed with migration? (y/N): ");
      process.stdin.once("data", (data) => {
        const response = data.toString().trim().toLowerCase();
        resolve(response === "y" || response === "yes");
      });
    });

    if (!confirmed) {
      console.log("\n❌ Migration cancelled.");
      process.exit(0);
    }
  }

  // Run migrations
  console.log("\n🚀 Starting migration...\n");

  const filtersResult = await migrateCategoryFilters();
  const sortablesResult = await migrateCategorySortables();

  // Generate post-migration report
  console.log("\nPost-migration state:");
  await generateReport();

  // Summary
  console.log("\n📋 Migration Summary\n");
  console.log("====================\n");
  console.log("categoryFilters:");
  console.log(`  Migrated: ${filtersResult.migrated}`);
  console.log(`  Skipped (no mapping): ${filtersResult.skipped}`);
  console.log(`  Errors: ${filtersResult.errors}`);
  console.log("\ncategorySortables:");
  console.log(`  Migrated: ${sortablesResult.migrated}`);
  console.log(`  Skipped (no mapping): ${sortablesResult.skipped}`);
  console.log(`  Errors: ${sortablesResult.errors}`);

  const totalErrors = filtersResult.errors + sortablesResult.errors;
  
  if (totalErrors > 0) {
    console.log(`\n⚠️  Migration completed with ${totalErrors} errors.`);
    process.exit(1);
  } else {
    console.log("\n✅ Migration completed successfully!");
  }
}

// Run main
main().catch((err) => {
  console.error("\n❌ Fatal error:", err);
  process.exit(1);
});
