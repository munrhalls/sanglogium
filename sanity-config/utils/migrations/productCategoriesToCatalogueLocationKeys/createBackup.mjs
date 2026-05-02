import client from "./../../getClient.mjs";
import fs from "fs/promises";
import path from "path";

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup_products_${timestamp}.json`;

  console.log("💾 Starting Backup Process...");

  try {
    // 1. Fetch exactly what we need to restore if things go wrong
    const query = `*[_type == "product"] {
      _id,
      name,
      categoryPath,
      catalogueLocationKeys
    }`;

    const data = await client.fetch(query);

    // 2. Write to a local file
    const outputPath = path.resolve(filename);
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));

    console.log(`\n✅ Backup Successful!`);
    console.log(`📦 Saved ${data.length} records.`);
    console.log(`pl file: ${outputPath}`);
    console.log(
      "\n👉 IMPORTANT: Do not delete or modify this file until migration is 100% verified."
    );
  } catch (error) {
    console.error("❌ Backup Failed:", error.message);
    process.exit(1); // Exit with error code so we don't proceed accidentally
  }
}

createBackup();
