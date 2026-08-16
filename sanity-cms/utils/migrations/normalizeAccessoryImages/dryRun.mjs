import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { readClient } from "../normalizeIemImages/getClient.mjs";
import { measureImageBuffer, normalizeImageBuffer, evaluatePass } from "../normalizeIemImages/imageNormalization.mjs";
import catalogueIndex from "../../../../data/catalogue-index.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_DIR = path.join(__dirname, "candidates");

// Same 7 homepage accessory categories/slots as HOMEPAGE_DATA_QUERY in
// sanity-cms/lib/homepage/getHomepageData.ts, resolved the same way
// (slug -> catalogueLocationKeys id via data/catalogue-index.json).
const CATEGORY_SLOTS = [
  { paramKey: "cablesId", slug: "headphone-cables" },
  { paramKey: "interconnectsId", slug: "interconnects" },
  { paramKey: "adaptersId", slug: "adapters" },
  { paramKey: "earpadsId", slug: "earpads" },
  { paramKey: "eartipsId", slug: "eartips" },
  { paramKey: "careCleaningId", slug: "care-cleaning" },
  { paramKey: "storageStandsId", slug: "headphone-stands" }, // combined into "storage" section
  { paramKey: "carryingCasesId", slug: "carrying-cases" }, // combined into "storage" section
];

function resolveSlugToId(slug) {
  return catalogueIndex.slugToIdMap[slug];
}

function slugifyFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function fetchImageBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  console.log("🚀 Phase 1 — Dry Run: Normalize homepage Accessories main images (no writes)\n");

  await fs.mkdir(CANDIDATES_DIR, { recursive: true });

  // Resolve every slot's catalogueLocationKeys id, keyed by GROQ param name.
  const slotIds = {};
  for (const slot of CATEGORY_SLOTS) {
    const id = resolveSlugToId(slot.slug);
    if (!id) {
      throw new Error(`resolveSlugToId returned undefined for "${slot.slug}" — check data/catalogue-index.json`);
    }
    slotIds[slot.paramKey] = id;
  }

  const query = `{
    "cables": *[_type == "product" && $cablesId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "interconnects": *[_type == "product" && $interconnectsId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "adapters": *[_type == "product" && $adaptersId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "earpads": *[_type == "product" && $earpadsId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "eartips": *[_type == "product" && $eartipsId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "careCleaning": *[_type == "product" && $careCleaningId in catalogueLocationKeys] { _id, name, image { asset->{ _id, url } } },
    "storage": *[_type == "product" && ($storageStandsId in catalogueLocationKeys || $carryingCasesId in catalogueLocationKeys)] { _id, name, image { asset->{ _id, url } } }
  }`;

  const result = await readClient.fetch(query, slotIds);

  // Flatten all 7 sections into one product list, deduped by _id
  // (storage combines two slots and could double up if a product were in both).
  const byId = new Map();
  for (const [sectionKey, items] of Object.entries(result)) {
    for (const item of items) {
      if (!byId.has(item._id)) {
        byId.set(item._id, { ...item, sections: [sectionKey] });
      } else {
        byId.get(item._id).sections.push(sectionKey);
      }
    }
  }
  const products = Array.from(byId.values());

  console.log(`📦 Found ${products.length} unique products across 7 accessory categories.\n`);

  const rows = [];
  const notes = [];

  for (const product of products) {
    const assetUrl = product.image?.asset?.url;
    const assetId = product.image?.asset?._id;

    if (!assetUrl) {
      rows.push({
        name: product.name,
        id: product._id,
        beforeFill: null,
        afterFill: null,
        marginPass: false,
        centerPass: false,
        overallPass: false,
        note: "SKIPPED — no image.asset.url on this product",
      });
      continue;
    }

    try {
      const sourceBuffer = await fetchImageBuffer(assetUrl);
      const result = await normalizeImageBuffer(sourceBuffer);
      const after = await measureImageBuffer(result.buffer);
      const passResult = evaluatePass(after.metrics);

      let note = "";
      if (!result.before.hasAlpha) {
        note = result.before.ambiguousBackground
          ? "NO ALPHA CHANNEL — corner colors disagree, background sampling is AMBIGUOUS, treat this measurement as uncertain"
          : "NO ALPHA CHANNEL — background inferred from corner sampling";
        notes.push(`${product.name}: ${note}`);
      }

      const outFilename = `${slugifyFilename(product.name)}-${assetId}-normalized.png`;
      const outPath = path.join(CANDIDATES_DIR, outFilename);
      await fs.writeFile(outPath, result.buffer);

      rows.push({
        name: product.name,
        id: product._id,
        beforeFill: result.before.metrics.fillRatio,
        afterFill: after.metrics.fillRatio,
        marginPass: passResult.marginPass,
        centerPass: passResult.centerPass,
        overallPass: passResult.overallPass,
        candidatePath: outPath,
        note,
      });
    } catch (err) {
      rows.push({
        name: product.name,
        id: product._id,
        beforeFill: null,
        afterFill: null,
        marginPass: false,
        centerPass: false,
        overallPass: false,
        note: `ERROR — ${err.message}`,
      });
    }
  }

  console.log("=".repeat(110));
  console.log(
    "Product".padEnd(45) +
      "Before".padEnd(10) +
      "After".padEnd(10) +
      "Margins".padEnd(10) +
      "Center".padEnd(10) +
      "Overall".padEnd(10) +
      "Note"
  );
  console.log("=".repeat(110));

  let passCount = 0;
  for (const row of rows) {
    const beforeStr = row.beforeFill != null ? row.beforeFill.toFixed(1) + "%" : "n/a";
    const afterStr = row.afterFill != null ? row.afterFill.toFixed(1) + "%" : "n/a";
    const marginsStr = row.beforeFill != null ? (row.marginPass ? "PASS" : "FAIL") : "-";
    const centerStr = row.beforeFill != null ? (row.centerPass ? "PASS" : "FAIL") : "-";
    const overallStr = row.overallPass ? "PASS" : "FAIL";
    if (row.overallPass) passCount++;

    console.log(
      row.name.slice(0, 44).padEnd(45) +
        beforeStr.padEnd(10) +
        afterStr.padEnd(10) +
        marginsStr.padEnd(10) +
        centerStr.padEnd(10) +
        overallStr.padEnd(10) +
        (row.note || "")
    );
  }
  console.log("=".repeat(110));
  console.log(`\n${passCount} of ${rows.length} passed.\n`);

  if (notes.length > 0) {
    console.log("⚠️  Uncertainty notes (no-alpha images):");
    notes.forEach((n) => console.log(`   - ${n}`));
    console.log("");
  }

  const failing = rows.filter((r) => !r.overallPass);
  if (failing.length > 0) {
    console.log("❌ Products that did NOT pass (will be SKIPPED in Phase 2, not force-written):");
    failing.forEach((r) => {
      const beforeStr = r.beforeFill != null ? r.beforeFill.toFixed(1) + "%" : "n/a";
      const afterStr = r.afterFill != null ? r.afterFill.toFixed(1) + "%" : "n/a";
      console.log(`   - ${r.name} (${r.id}): before=${beforeStr} after=${afterStr} ${r.note || ""}`);
    });
    console.log("");
  }

  console.log(`Candidates written to: ${CANDIDATES_DIR}`);
  console.log("Phase 1 complete. Review this report before running Phase 2 (PRODUCTION_patchPhased.mjs).");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
