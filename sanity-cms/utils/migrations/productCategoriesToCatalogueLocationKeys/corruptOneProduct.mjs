import client from "./../../getClient.mjs";

// ⚠️ PASTE AN ID FROM YOUR BACKUP FILE HERE
const VICTIM_ID = "3O1ZNp54LWQGln4uEAU7Vs";

async function corruptProduct() {
  console.log(`😈 Starting Data Corruption Test on: ${VICTIM_ID}`);

  try {
    // 1. Show current state
    const before = await client.fetch(
      `*[_id == $id][0].catalogueLocationKeys`,
      { id: VICTIM_ID }
    );
    console.log("   Before:", before);

    // 2. Break it (Set to a bogus value)
    await client
      .patch(VICTIM_ID)
      .set({ catalogueLocationKeys: ["CORRUPTED_DATA_TEST"] })
      .commit();

    // 3. Verify it is broken
    const after = await client.fetch(`*[_id == $id][0].catalogueLocationKeys`, {
      id: VICTIM_ID,
    });
    console.log("   After: ", after);

    console.log("\n✅ Product successfully corrupted. Now run rollback.mjs!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

corruptProduct();
