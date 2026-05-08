import client from "./../../getClient.mjs";
import readline from "readline";

// --- CONFIGURATION ---
const BATCH_SIZE = 50;
const TEST_MODE = false; // ⚠️ WRITES TO DB

// --- 1. MAPPING DICTIONARY ---
const manualOverrides = {
  bluetooth: "bluetooth-speakers",
  bookshelf: "bookshelf-speakers",
  outdoor: "outdoor-speakers",
  subwoofers: "subwoofers",
  dacs: "dacs-digital-to-analog-converters",
  amps: "amplifiers",
  preamps: "preamps",
  receivers: "receivers",
  turntables: "turntables",
  "cd-players": "cd-players",
  stands: "speaker-stands",
  mounts: "wall-mounts",
  "media-players-and-streamers": "digital-audio-players",
  "portable-dacs": "portable-dacs-and-amps",
  "headphone-amps": "headphone-amplifiers",
  "power-strips": "power-management",
  "tips-and-ear-pads": "replacement-parts",
  "wireless-speakers": "powered-speakers",
  "floor-standing": "floor-standing-speakers",
};

// --- 2. SMART RESOLVER RULES ---
const SMART_RULES = {
  cables: [
    { contains: "power", target: "power-cables" },
    { contains: "hdmi", target: "hdmi-cables" },
    { contains: "usb", target: "usb-cables" },
    { contains: "ethernet", target: "ethernet-cables" },
    { contains: "rca", target: "rca-cables" },
    { contains: "headphone", target: "headphone-cables" },
    { default: "audio-cables" },
  ],
};

// --- 3. HELPER FUNCTIONS ---
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function buildMenuMap(nodes, map = new Map()) {
  if (!nodes) return map;
  for (const node of nodes) {
    if (node.slug?.current) map.set(node.slug.current, node._key);
    if (node.children) buildMenuMap(node.children, map);
  }
  return map;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

// --- 4. MAIN MIGRATION LOGIC ---
async function migratePhased() {
  console.log("🚀 Starting Phased Migration (Final Sealed Version)...");

  try {
    // A. Setup Maps
    const catalogueDoc = await client.fetch(`*[_id == "catalogue"][0]`);
    if (!catalogueDoc) throw new Error("Catalogue missing!");
    const menuMap = buildMenuMap(catalogueDoc.catalogue || []);

    // B. Fetch Products
    const allProducts = await client.fetch(
      `*[_type == "product" && defined(categoryPath)] { _id, name, categoryPath }`
    );
    console.log(`📦 Found ${allProducts.length} products to process.\n`);

    // C. Build the Queue
    const queue = [];

    for (const product of allProducts) {
      // 🛡️ FINAL SAFETY: Handle Arrays, Nested Arrays, AND Rogue Strings
      let legacyPaths = [];
      if (Array.isArray(product.categoryPath)) {
        legacyPaths = product.categoryPath.flat(Infinity);
      } else if (typeof product.categoryPath === "string") {
        legacyPaths = [product.categoryPath];
      }

      const newKeys = new Set();

      for (const rawPath of legacyPaths) {
        if (typeof rawPath !== "string") continue;
        const leaf = rawPath.split("/").pop().toLowerCase();
        let key = null;

        // 1. Smart Check
        if (SMART_RULES[leaf]) {
          const productName = product.name.toLowerCase();
          const rule = SMART_RULES[leaf].find(
            (r) => r.default || productName.includes(r.contains)
          );
          if (rule) key = menuMap.get(rule.target || rule.default);
        }

        // 2. Fallbacks
        if (!key) key = menuMap.get(manualOverrides[leaf]);
        if (!key) key = menuMap.get(slugify(leaf));
        if (!key) key = menuMap.get(slugify(rawPath.replace(/\//g, "-")));

        if (key) newKeys.add(key);
      }

      if (newKeys.size > 0) {
        queue.push({
          id: product._id,
          name: product.name,
          keys: Array.from(newKeys),
          legacy: legacyPaths,
        });
      }
    }

    console.log(
      `✅ Ready to migrate ${queue.length} products in batches of ${BATCH_SIZE}.`
    );

    // D. Process Batches
    let processed = 0;
    while (processed < queue.length) {
      const batch = queue.slice(processed, processed + BATCH_SIZE);
      const remaining = queue.length - (processed + batch.length);

      console.log("\n------------------------------------------------");
      console.log(
        `📝 BATCH PREVIEW (${processed + 1} - ${processed + batch.length})`
      );
      console.log("------------------------------------------------");

      batch.slice(0, 3).forEach((p) => {
        console.log(`   ${p.name}`);
        console.log(
          `   ↳ Keys: ${p.keys.length} | Legacy: ${JSON.stringify(p.legacy)}`
        );
      });
      if (batch.length > 3) console.log(`   ... and ${batch.length - 3} more.`);

      console.log("------------------------------------------------");

      const answer = await ask(
        `\n👉 Press ENTER to commit this batch, or 'q' to quit: `
      );

      if (answer.toLowerCase() === "q") {
        console.log("🛑 Migration aborted by user.");
        break;
      }

      if (!TEST_MODE) {
        const transaction = client.transaction();
        batch.forEach((item) => {
          transaction.patch(item.id, (p) =>
            p.set({ catalogueLocationKeys: item.keys })
          );
        });
        await transaction.commit();
        console.log(`💾 Batch committed! (${remaining} remaining)`);
      } else {
        console.log(`👻 [TEST] Batch simulated.`);
      }

      processed += batch.length;
    }

    console.log("\n✨ Migration Process Finished.");
    rl.close();
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    rl.close();
  }
}

migratePhased();
