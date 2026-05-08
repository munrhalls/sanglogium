import client from "./../../getClient.mjs";

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

async function runDryRun() {
  console.log("🚀 Starting Full Catalog Dry Run (V8 - Smart & Dedup Check)...");

  try {
    const catalogueDoc = await client.fetch(`*[_id == "catalogue"][0]`);
    if (!catalogueDoc) throw new Error("Catalogue missing!");

    const menuMap = buildMenuMap(catalogueDoc.catalogue || []);
    const allProducts = await client.fetch(
      `*[_type == "product" && defined(categoryPath)] { _id, name, categoryPath }`
    );

    console.log(`📦 Analyzing ${allProducts.length} products...`);

    const readyToMigrate = [];
    const failures = [];

    // Logs for verification
    const smartLog = {};
    const dedupLog = []; // <--- NEW: Tracks merged duplicates

    for (const product of allProducts) {
      const legacyPaths = product.categoryPath || [];
      const rawKeys = []; // Store ALL matches first (including duplicates)

      for (const rawPath of legacyPaths) {
        if (typeof rawPath !== "string") continue;

        const leaf = rawPath.split("/").pop().toLowerCase();
        let key = null;
        let smartTarget = null;
        let isSmartMatch = false;

        // 1. SMART CHECK
        if (SMART_RULES[leaf]) {
          const productName = product.name.toLowerCase();
          const rule = SMART_RULES[leaf].find(
            (r) => r.default || productName.includes(r.contains)
          );

          if (rule) {
            smartTarget = rule.target || rule.default;
            key = menuMap.get(smartTarget);
            isSmartMatch = true;
          }
        }

        // 2. DICTIONARY CHECK
        if (!key) key = menuMap.get(manualOverrides[leaf]);

        // 3. FUZZY CHECK
        if (!key) key = menuMap.get(slugify(leaf));

        // 4. WHOLE PATH CHECK
        if (!key) key = menuMap.get(slugify(rawPath.replace(/\//g, "-")));

        if (key) {
          rawKeys.push(key);
          // Smart Log logic
          if (isSmartMatch) {
            if (!smartLog[smartTarget]) smartLog[smartTarget] = [];
            smartLog[smartTarget].push(product.name);
          }
        }
      }

      // --- DEDUPLICATION LOGIC ---
      // We convert the array of raw keys into a Set to remove duplicates
      const uniqueKeys = new Set(rawKeys);

      // If the size shrank, we successfully merged a duplicate!
      if (uniqueKeys.size < rawKeys.length) {
        dedupLog.push({
          name: product.name,
          rawCount: rawKeys.length,
          uniqueCount: uniqueKeys.size,
        });
      }

      if (uniqueKeys.size > 0) {
        readyToMigrate.push({ id: product._id });
      } else {
        failures.push({ name: product.name, legacyData: legacyPaths });
      }
    }

    console.log(
      `\n✅ Ready: ${readyToMigrate.length} | ❌ Failures: ${failures.length}`
    );

    // --- REPORT 1: SMART LOGIC ---
    const smartKeys = Object.keys(smartLog);
    if (smartKeys.length > 0) {
      console.log("\n🧠 Smart Logic Breakdown:");
      console.log("-----------------------------------------------");
      smartKeys.forEach((target) => {
        const items = smartLog[target];
        console.log(
          `👉 ${target.toUpperCase()}: ${items.length} products found`
        );
        items.slice(0, 3).forEach((name) => console.log(`      - ${name}`));
      });
    }

    // --- REPORT 2: DEDUPLICATION ---
    if (dedupLog.length > 0) {
      console.log("\n🔄 Deduplication Report (Redundancy Eliminated):");
      console.log("-----------------------------------------------");
      console.log(
        `Found ${dedupLog.length} products with redundant categories.`
      );
      dedupLog.slice(0, 5).forEach((d) => {
        console.log(
          `   - "${d.name}" merged ${d.rawCount} paths into ${d.uniqueCount} unique location.`
        );
      });
      console.log("-----------------------------------------------");
    } else {
      console.log("\n✅ No duplicates found in legacy data (Clean dataset).");
    }

    if (failures.length > 0) {
      console.log(
        "⚠️ Remaining Failures:",
        JSON.stringify(failures.slice(0, 5), null, 2)
      );
    } else {
      console.log("\n✨ 100% MATCH! Protocol Check 2 (Duplicates) Passed.");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

runDryRun();
