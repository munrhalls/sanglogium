/**
 * seed-catalogue.mjs
 *
 * Seeds the Sanity Content Lake with the full recursive catalogue tree.
 *
 * USAGE:
 *   1. Add SANITY_API_TOKEN to your .env file (Editor-level write token
 *      from sanity.io/manage → [your project] → API → Tokens)
 *   2. node scripts/seed-catalogue.mjs
 *
 * SAFE TO RE-RUN: uses createOrReplace — idempotent.
 */

import { createClient } from "next-sanity";
import { createId } from "@paralleldrive/cuid2";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ─── Env ─────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_TOKEN = process.env.SANITY_STUDIO_READ_WRITE_CREATE;

if (!PROJECT_ID) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env");
if (!DATASET)    throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET in .env");


// ─── Sanity client ────────────────────────────────────────────────────────────

const client = createClient({
  projectId: PROJECT_ID,
  dataset:   DATASET,
  useCdn:    false,           // mutations must bypass CDN
  apiVersion: "2024-11-14",  // matches sanity/env.ts
  token:     API_TOKEN,
});

// ─── Raw source data ──────────────────────────────────────────────────────────
//
// Defined inline so the script is self-contained and runnable from anywhere
// inside the repo. This is identical to catalogue-nav-data.json.

const RAW_CATALOGUE = [
  {
    title: "Headphones",
    type: "header",
    slug: { current: "headphones", _type: "slug" },
    icon: "headphones",
    children: [
      {
        title: "By Design",
        type: "header",
        children: [
          { title: "Open-Back",    type: "link", slug: { current: "open-back",    _type: "slug" } },
          { title: "Closed-Back",  type: "link", slug: { current: "closed-back",  _type: "slug" } },
        ],
      },
      {
        title: "By Driver",
        type: "header",
        children: [
          { title: "Planar Magnetic", type: "link", slug: { current: "planar-magnetic", _type: "slug" } },
          { title: "Dynamic",         type: "link", slug: { current: "dynamic",         _type: "slug" } },
          { title: "Electrostatic",   type: "link", slug: { current: "electrostatic",   _type: "slug" } },
        ],
      },
      {
        title: "In-Ear & Wireless",
        type: "header",
        children: [
          { title: "Monitors (IEMs)",     type: "link", slug: { current: "monitors-iems",     _type: "slug" } },
          { title: "True Wireless (TWS)", type: "link", slug: { current: "true-wireless-tws", _type: "slug" } },
        ],
      },
    ],
  },
  {
    title: "Audio Electronics",
    type: "header",
    slug: { current: "audio-electronics", _type: "slug" },
    icon: "audio-electronics",
    children: [
      {
        title: "Amplification",
        type: "header",
        children: [
          { title: "Desktop Amps",  type: "link", slug: { current: "desktop-amps",  _type: "slug" } },
          { title: "Portable Amps", type: "link", slug: { current: "portable-amps", _type: "slug" } },
        ],
      },
      {
        title: "Digital Sources",
        type: "header",
        children: [
          { title: "Standalone DACs",       type: "link", slug: { current: "standalone-dacs",       _type: "slug" } },
          { title: "DAC/Amp Combos",        type: "link", slug: { current: "dac-amp-combos",        _type: "slug" } },
          { title: "Digital Players (DAPs)", type: "link", slug: { current: "digital-players-daps", _type: "slug" } },
          { title: "Network Streamers",     type: "link", slug: { current: "network-streamers",     _type: "slug" } },
        ],
      },
    ],
  },
  {
    title: "Accessories",
    type: "header",
    slug: { current: "accessories", _type: "slug" },
    icon: "accessories",
    children: [
      {
        title: "Connectivity",
        type: "header",
        children: [
          { title: "Headphone Cables", type: "link", slug: { current: "headphone-cables", _type: "slug" } },
          { title: "Interconnects",    type: "link", slug: { current: "interconnects",    _type: "slug" } },
          { title: "Adapters",         type: "link", slug: { current: "adapters",         _type: "slug" } },
        ],
      },
      {
        title: "Maintenance",
        type: "header",
        children: [
          { title: "Earpads",         type: "link", slug: { current: "earpads",         _type: "slug" } },
          { title: "Care & Cleaning", type: "link", slug: { current: "care-cleaning",   _type: "slug" } },
        ],
      },
      {
        title: "Storage",
        type: "header",
        children: [
          { title: "Headphone Stands", type: "link", slug: { current: "headphone-stands", _type: "slug" } },
          { title: "Carrying Cases",   type: "link", slug: { current: "carrying-cases",   _type: "slug" } },
        ],
      },
    ],
  },
];

// ─── Transformation ───────────────────────────────────────────────────────────
//
// Walks the raw tree and creates flat documents with references.
// Each document gets a unique cuid2 ID that becomes both the document _id
// and the _key used in child references.

function flattenTree(rawArray, parentId = null, parentSortOrder = 0) {
  const flatDocs = [];

  for (let i = 0; i < rawArray.length; i++) {
    const raw = rawArray[i];

    // Create flat document for this node
    const doc = {
      _id: createId(),                    // unique cuid2 string
      _type: "catalogueItem",
      title: raw.title,
      type: raw.type ?? "link",
      sortOrder: i,                      // preserve original array position
    };

    // Only attach slug when it is genuinely present and has a value.
    if (raw.slug?.current) {
      doc.slug = {
        _type: "slug",
        current: raw.slug.current,
      };
    }

    // Optional icon (root items only)
    if (raw.icon) {
      doc.icon = raw.icon;
    }

    // Parent reference (optional - roots will have no parent)
    if (parentId) {
      doc.parent = {
        _type: "reference",
        _ref: parentId
      };
    }

    // Children as references - recursively process and add to flat array
    if (Array.isArray(raw.children) && raw.children.length > 0) {
      // First, recursively process children to get their document IDs
      const childDocs = flattenTree(raw.children, doc._id, i);

      // Add child documents to the flat array
      flatDocs.push(...childDocs);
    }

    flatDocs.push(doc);
  }

  return flatDocs;
}

// ─── Seed function ────────────────────────────────────────────────────────────

async function seedCatalogue() {
  console.log("🌱  Starting Sanity catalogue seed...");
  console.log(`    Project : ${PROJECT_ID}`);
  console.log(`    Dataset : ${DATASET}`);

  // 1. Transform
  console.log("\n📐  Flattening raw data to flat documents...");
  const flatDocuments = flattenTree(RAW_CATALOGUE);
  console.log(`    ✓ Generated ${flatDocuments.length} flat documents`);

  // Quick sanity-check: every document must have _id and _type
  let rootCount = 0;
  let groupCount = 0;
  let leafCount = 0;

  for (const doc of flatDocuments) {
    if (!doc._id)  throw new Error(`Document "${doc.title}" is missing _id`);
    if (!doc._type) throw new Error(`Document "${doc.title}" is missing _type`);

    if (doc.type === "header") {
      if (doc.icon) {
        rootCount++;
      } else {
        groupCount++;
      }
    } else {
      leafCount++;
    }
  }

  console.log(`    ✓ Audited: ${rootCount} roots, ${groupCount} groups, ${leafCount} leaves (${flatDocuments.length} total)`);

  // 2. Write to Sanity
  console.log("\n🚀  Writing flat documents to Sanity Content Lake...");

  const transaction = client.transaction();

  for (const doc of flatDocuments) {
    transaction.createOrReplace(doc);
  }

  await transaction.commit();
  console.log("    ✓ Transaction committed");

  // 3. Read-back verification
  console.log("\n🔍  Verifying write...");
  const result = await client.fetch(`*[_type == "catalogueItem"]`);

  if (!result || result.length === 0) {
    throw new Error("Read-back failed — no documents found after write");
  }

  console.log(`    ✓ Read-back success: ${result.length} catalogueItem documents in Content Lake`);

  if (result.length !== flatDocuments.length) {
    console.warn(
      `⚠️  Expected ${flatDocuments.length} documents but got ${result.length}`
    );
  }

  // 4. Done
  console.log(`
✅  Seed complete!

Summary:
  • Total documents created: ${result.length}
  • Root nodes (with icon): ${rootCount}
  • Group headers: ${groupCount}
  • Leaf links: ${leafCount}

Next steps:
  1. Open http://localhost:3000/studio
  2. Navigate to "Catalogue" in the sidebar
  3. You should see ${result.length} individual catalogueItem documents
  4. Click "Publish" to promote the Drafts to Published
     (frontend GROQ queries read from the published version by default)
  5. Run:  node scripts/build-catalogue-index.mjs
     to regenerate data/catalogue-index.json from the live data
`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

seedCatalogue().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
