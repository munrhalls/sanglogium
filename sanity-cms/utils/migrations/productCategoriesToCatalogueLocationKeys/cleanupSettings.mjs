import client from "./../../getClient.mjs";

async function cleanupSettings() {
  console.log("🗑️  Deleting obsolete 'settings' document...");
  try {
    const result = await client.delete("settings");
    console.log("✅ Cleanup successful!", result);
  } catch (err) {
    console.error("❌ Cleanup failed (or document already gone):", err.message);
  }
}

cleanupSettings();
