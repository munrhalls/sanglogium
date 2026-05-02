import client from "./../../getClient.mjs";

async function verifyMigration() {
  console.log("🕵️Starting Post-Migration Integrity Audit...");

  try {
    // 1. Fetch the Truth (The Catalogue)
    const catalogueDoc = await client.fetch(`*[_id == "catalogue"][0]`);
    const validKeys = new Set();

    function extractKeys(nodes) {
      if (!nodes) return;
      for (const node of nodes) {
        validKeys.add(node._key);
        if (node.children) extractKeys(node.children);
      }
    }
    extractKeys(catalogueDoc.catalogue);
    console.log(`📘 Catalogue contains ${validKeys.size} valid location keys.`);

    // 2. Fetch the State (The Products)
    const allProducts = await client.fetch(
      `*[_type == "product"] { _id, name, catalogueLocationKeys }`
    );
    console.log(`📦 Auditing ${allProducts.length} products...\n`);

    // 3. Analyze
    const success = [];
    const unmigrated = []; // No keys at all
    const brokenLinks = []; // Keys exist but point to nothing (Data Corruption)

    for (const p of allProducts) {
      if (!p.catalogueLocationKeys || p.catalogueLocationKeys.length === 0) {
        unmigrated.push(p.name);
        continue;
      }

      const invalidKeys = p.catalogueLocationKeys.filter(
        (k) => !validKeys.has(k)
      );

      if (invalidKeys.length > 0) {
        brokenLinks.push({ name: p.name, badKeys: invalidKeys });
      } else {
        success.push(p.name);
      }
    }

    // 4. The Verdict
    console.log("------------------------------------------------");
    console.log("📊 FINAL AUDIT REPORT");
    console.log("------------------------------------------------");
    console.log(`✅ Verified:      ${success.length} products (Healthy)`);
    console.log(`⚠️ Unmigrated:    ${unmigrated.length} products (Empty)`);
    console.log(`❌ Broken Links:  ${brokenLinks.length} products (CORRUPTED)`);
    console.log("------------------------------------------------");

    if (brokenLinks.length > 0) {
      console.log("\n🛑 CRITICAL: Data Integrity Violation found!");
      console.log(JSON.stringify(brokenLinks, null, 2));
    } else if (unmigrated.length > 0) {
      console.log(
        "\n⚠️ Note: Some products have no category. This might be intentional if they are draft/archived."
      );
    } else {
      console.log("\n🏆 100% SUCCESS. The database is clean.");
    }
  } catch (error) {
    console.error("Audit Failed:", error.message);
  }
}

verifyMigration();
