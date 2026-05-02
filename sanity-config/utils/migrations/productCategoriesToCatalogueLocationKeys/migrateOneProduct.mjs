import client from "./../../getClient.mjs";

// 1. Recursive helper to build the Map (Slug -> Key)
function buildMenuMap(nodes, map = new Map()) {
  if (!nodes) return map; // Safety check

  for (const node of nodes) {
    // We map the SLUG (string) to the KEY (stable ID)
    if (node.slug?.current) {
      map.set(node.slug.current, node._key);
    }
    // Recurse into children
    if (node.children && node.children.length > 0) {
      buildMenuMap(node.children, map);
    }
  }
  return map;
}

async function migrateOneProduct() {
  console.log("🚀 Starting Single Product Migration Test...");

  try {
    // A. Load the New Catalogue (The Target)
    // UPDATED: Fetch 'catalogue' singleton
    const catalogueDoc = await client.fetch(`*[_id == "catalogue"][0]`);

    if (!catalogueDoc) {
      throw new Error(
        "Catalogue document not found! Did you run seedCatalogue?"
      );
    }

    // UPDATED: Access the 'catalogue' field, not 'mainMenu'
    const menuMap = buildMenuMap(catalogueDoc.catalogue || []);
    console.log(`🗺️  Menu Map built with ${menuMap.size} valid locations.`);

    // B. Load ONE Product with legacy data (The Source)
    // We pick the first one that has a defined categoryPath
    const product = await client.fetch(
      `*[_type == "product" && defined(categoryPath)][0]`
    );

    if (!product) {
      console.log(
        "⚠️ No products found with 'categoryPath'. Migration not needed or field is empty."
      );
      return;
    }

    console.log(`\n📦 Processing Product: "${product.name}"`);
    console.log(`   Legacy Path: ${JSON.stringify(product.categoryPath)}`);

    // C. The Matching Logic
    const legacyPaths = product.categoryPath || [];
    const newKeys = [];

    for (const rawPath of legacyPaths) {
      if (typeof rawPath !== "string") continue;

      // Strategy 1: Leaf Node (e.g. "audio/cables" -> "cables")
      const leaf = rawPath.split("/").pop();

      // Strategy 2: Hyphenated (e.g. "audio/cables" -> "audio-cables")
      const hyphenated = rawPath.replace(/\//g, "-");

      let matchedKey = menuMap.get(leaf);

      if (matchedKey) {
        console.log(`   ✅ Matched via Leaf: "${leaf}" -> Key: ${matchedKey}`);
      } else {
        matchedKey = menuMap.get(hyphenated);
        if (matchedKey) {
          console.log(
            `   ✅ Matched via Hyphen: "${hyphenated}" -> Key: ${matchedKey}`
          );
        }
      }

      if (matchedKey) {
        newKeys.push(matchedKey);
      } else {
        console.log(
          `   ❌ FAILED to match: "${rawPath}" (Tried: ${leaf}, ${hyphenated})`
        );
      }
    }

    // D. The Transaction (Write)
    if (newKeys.length > 0) {
      console.log(
        `\n💾 Writing ${newKeys.length} keys to 'catalogueLocationKeys'...`
      );

      const patch = await client
        .patch(product._id)
        .set({ catalogueLocationKeys: newKeys })
        .commit();

      console.log(`🎉 Success! Product updated. Rev: ${patch._rev}`);
      console.log(`   Verify in Studio: ${product._id}`);
    } else {
      console.log(
        "\n⚠️ No valid keys found. Skipping write to prevent data corruption."
      );
    }
  } catch (error) {
    console.error("❌ Migration Error:", error.message);
  }
}

migrateOneProduct();
