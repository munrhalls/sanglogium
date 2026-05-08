import client from "./../../getClient.mjs";
import fs from "fs/promises";
import path from "path";

// ⚠️ UPDATE THIS TO YOUR EXACT BACKUP PATH
const BACKUP_FILENAME = "backup_products_2026-01-02T13-42-16-761Z.json";

// --- 1. THE LOGIC (MUST MATCH MIGRATION EXACTLY) ---
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

// --- 2. THE VERIFIER ---
async function verifyFidelity() {
  console.log("🕵️ Starting 100% Fidelity Check (Backup vs. Live vs. Logic)...");

  try {
    // A. Load Backup (The Past)
    const backupPath = path.resolve(process.cwd(), BACKUP_FILENAME);
    // Note: adjusted path logic to look in current root or absolute if needed.
    // Ideally put the full path or ensure relative path is correct from where you run node.

    // Attempting to read relative to the script execution folder usually:
    // If you run from root: ./sanity/backups/...
    // Let's assume the user puts the path correctly in the CONST above.

    let backupData;
    try {
      const fileContent = await fs.readFile(BACKUP_FILENAME, "utf-8");
      backupData = JSON.parse(fileContent);
    } catch (e) {
      // Fallback: try looking in 'sanity/backups/' if the file name alone was given
      const fallbackPath = path.join("sanity", "backups", BACKUP_FILENAME);
      console.log(`   (File not found at root, trying: ${fallbackPath})`);
      const fileContent = await fs.readFile(fallbackPath, "utf-8");
      backupData = JSON.parse(fileContent);
    }

    console.log(`📜 Loaded Backup: ${backupData.length} records.`);

    // B. Load Catalogue (The Map)
    const catalogueDoc = await client.fetch(`*[_id == "catalogue"][0]`);
    const menuMap = buildMenuMap(catalogueDoc.catalogue || []);
    console.log(`🗺️  Catalogue Map: Loaded ${menuMap.size} keys.`);

    // C. Load Live Data (The Present)
    const liveProducts = await client.fetch(
      `*[_type == "product"] { _id, name, catalogueLocationKeys }`
    );
    const liveMap = new Map(liveProducts.map((p) => [p._id, p]));
    console.log(`📡 Live Data: Loaded ${liveProducts.length} records.\n`);

    // D. The Comparison Loop
    let passed = 0;
    let failed = 0;
    let skipped = 0; // Items that had no legacy data to begin with

    for (const backupItem of backupData) {
      // 1. Get Legacy Data Safely
      let legacyPaths = [];
      if (Array.isArray(backupItem.categoryPath)) {
        legacyPaths = backupItem.categoryPath.flat(Infinity);
      } else if (typeof backupItem.categoryPath === "string") {
        legacyPaths = [backupItem.categoryPath];
      }

      if (legacyPaths.length === 0) {
        skipped++;
        continue;
      }

      // 2. CALCULATE EXPECTED KEYS (The Logic)
      const expectedKeys = new Set();
      for (const rawPath of legacyPaths) {
        if (typeof rawPath !== "string") continue;
        const leaf = rawPath.split("/").pop().toLowerCase();
        let key = null;

        // Smart Check
        if (SMART_RULES[leaf]) {
          const productName = backupItem.name.toLowerCase();
          const rule = SMART_RULES[leaf].find(
            (r) => r.default || productName.includes(r.contains)
          );
          if (rule) key = menuMap.get(rule.target || rule.default);
        }
        // Fallbacks
        if (!key) key = menuMap.get(manualOverrides[leaf]);
        if (!key) key = menuMap.get(slugify(leaf));
        if (!key) key = menuMap.get(slugify(rawPath.replace(/\//g, "-")));

        if (key) expectedKeys.add(key);
      }

      // 3. FETCH ACTUAL KEYS (The Reality)
      const liveItem = liveMap.get(backupItem._id);
      if (!liveItem) {
        console.log(
          `❌ ERROR: Product ${backupItem.name} missing from Live DB!`
        );
        failed++;
        continue;
      }

      const actualKeys = new Set(liveItem.catalogueLocationKeys || []);

      // 4. COMPARE (The Proof)
      // Check if sets are equal: Size must match, and every expected key must exist in actual.
      const isMatch =
        expectedKeys.size === actualKeys.size &&
        [...expectedKeys].every((k) => actualKeys.has(k));

      if (isMatch) {
        passed++;
      } else {
        failed++;
        console.log("---------------------------------------------------");
        console.log(`❌ FIDELITY FAILURE: "${backupItem.name}"`);
        console.log(`   Legacy Path:  ${JSON.stringify(legacyPaths)}`);
        console.log(`   Calculated:   ${JSON.stringify([...expectedKeys])}`);
        console.log(`   Live DB Has:  ${JSON.stringify([...actualKeys])}`);
        console.log("---------------------------------------------------");
      }
    }

    // E. Final Report
    console.log("\n========================================");
    console.log("🎓 FIDELITY AUDIT REPORT");
    console.log("========================================");
    console.log(`✅ PASSED (Perfect Match): ${passed}`);
    console.log(`❌ FAILED (Mismatch):      ${failed}`);
    console.log(`⚪ SKIPPED (No Legacy Data): ${skipped}`);
    console.log("========================================");

    if (failed === 0) {
      console.log(
        "\n🏆 CERTIFIED: 100% Data Fidelity. The migration is mathematically perfect."
      );
    } else {
      console.log(
        "\n⚠️ WARNING: Discrepancies found. Do not proceed until resolved."
      );
    }
  } catch (error) {
    console.error("\n❌ Script Error:", error.message);
  }
}

verifyFidelity();
