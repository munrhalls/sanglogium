import client from "./../../getClient.mjs";
import fs from "fs/promises";
import path from "path";

// ⚠️ CONFIGURE THIS: The name of the backup file you just created
const BACKUP_FILE =
  "sanity/backups/backup_products_2026-01-02T13-42-16-761Z.json";

// Optional: Set a specific ID to test rollback on just one item first
const TEST_ONLY_ID = "3O1ZNp54LWQGln4uEAU7Vs"; // e.g. "3O1ZNp54LWQGln4uEAU7Vs"

async function rollback() {
  console.log("Rewinding Database State... ⏪");

  try {
    // 1. Read Backup
    const filePath = path.resolve(BACKUP_FILE);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const backupData = JSON.parse(fileContent);

    console.log(`📖 Loaded backup: ${filePath}`);
    console.log(`📦 Records in backup: ${backupData.length}`);

    // Filter for test mode if active
    const recordsToProcess = TEST_ONLY_ID
      ? backupData.filter((item) => item._id === TEST_ONLY_ID)
      : backupData;

    if (recordsToProcess.length === 0) {
      console.log("⚠️ No records found to restore (check TEST_ONLY_ID).");
      return;
    }

    console.log(
      `⚙️  Preparing to restore ${recordsToProcess.length} products...`
    );

    // 2. Batched Transactions (Safety Limit: 100 per batch)
    let transaction = client.transaction();
    let batchSize = 0;
    let successCount = 0;

    for (const item of recordsToProcess) {
      // Logic: If backup has keys, SET them. If null/undefined, UNSET them.
      if (item.catalogueLocationKeys && item.catalogueLocationKeys.length > 0) {
        transaction.patch(item._id, (p) =>
          p.set({ catalogueLocationKeys: item.catalogueLocationKeys })
        );
      } else {
        transaction.patch(item._id, (p) => p.unset(["catalogueLocationKeys"]));
      }

      batchSize++;

      // Commit every 100 items
      if (batchSize >= 100) {
        await transaction.commit();
        console.log(`   ...restored batch of ${batchSize} items.`);
        transaction = client.transaction(); // Reset
        successCount += batchSize;
        batchSize = 0;
      }
    }

    // Commit remaining
    if (batchSize > 0) {
      await transaction.commit();
      successCount += batchSize;
    }

    console.log(`\n✅ Rollback Complete!`);
    console.log(`🎉 Restored ${successCount} products to their backup state.`);
  } catch (error) {
    console.error("❌ Rollback Failed:", error.message);
    console.error("   (Double check your BACKUP_FILE name)");
  }
}

rollback();
