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
// Recursively walks the raw tree and injects the two things Sanity requires
// on every object that appears inside an array:
//
//   _type  → must match the schema object name: "catalogueItem"
//   _key   → must be a unique non-empty string across the whole document
//
// Slug objects already carry _type: "slug" in the source data — preserved as-is.
// Header nodes without a slug have the slug field omitted entirely (not set to
// null) to avoid Sanity Studio render warnings on hidden-but-populated fields.

function transformNode(raw) {
  const node = {
    _type: "catalogueItem",
    _key:  createId(),          // globally unique cuid2 string
    title: raw.title,
    type:  raw.type ?? "link",
  };

  // Only attach slug when it is genuinely present and has a value.
  // Omit it completely for pure headers that have no slug in the source.
  if (raw.slug?.current) {
    node.slug = {
      _type:   "slug",
      current: raw.slug.current,
    };
  }

  // Optional icon (root items only)
  if (raw.icon) {
    node.icon = raw.icon;
  }

  // Recurse into children array
  if (Array.isArray(raw.children) && raw.children.length > 0) {
    node.children = raw.children.map(transformNode);
  }

  return node;
}

function transformCatalogue(rawArray) {
  return rawArray.map(transformNode);
}

// ─── Seed function ────────────────────────────────────────────────────────────

async function seedCatalogue() {
  console.log("🌱  Starting Sanity catalogue seed...");
  console.log(`    Project : ${PROJECT_ID}`);
  console.log(`    Dataset : ${DATASET}`);

  // 1. Transform
  console.log("\n📐  Transforming raw data...");
  const transformed = transformCatalogue(RAW_CATALOGUE);
  console.log(`    ✓ Transformed ${transformed.length} top-level items`);

  // Quick sanity-check: every node must have _key and _type
  let nodeCount = 0;
  function audit(nodes) {
    for (const n of nodes) {
      nodeCount++;
      if (!n._key)  throw new Error(`Node "${n.title}" is missing _key`);
      if (!n._type) throw new Error(`Node "${n.title}" is missing _type`);
      if (n.children) audit(n.children);
    }
  }
  audit(transformed);
  console.log(`    ✓ Audited ${nodeCount} total nodes — all have _key and _type`);

  // 2. Write to Sanity
  //    createOrReplace is used (not patch) because it works whether the
  //    document already exists or not, making the script safe to re-run.
  console.log("\n🚀  Writing to Sanity Content Lake...");

  const doc = {
    _id:       "catalogue",   // singleton ID — matches the GROQ query in build-catalogue-index.mjs
    _type:     "catalogue",   // matches catalogueType schema
    catalogue: transformed,   // matches the array field name in catalogueType
  };

  await client.createOrReplace(doc);
  console.log("    ✓ createOrReplace committed");

  // 3. Read-back verification
  console.log("\n🔍  Verifying write...");
  const result = await client.fetch(`*[_id == "catalogue"][0].catalogue`);

  if (!result) {
    throw new Error("Read-back failed — document not found after write");
  }

  console.log(`    ✓ Read-back success: ${result.length} top-level items in Content Lake`);

  if (result.length !== RAW_CATALOGUE.length) {
    console.warn(
      `⚠️  Expected ${RAW_CATALOGUE.length} top-level items but got ${result.length}`
    );
  }

  // 4. Done
  console.log(`
✅  Seed complete!

Next steps:
  1. Open http://localhost:3000/studio/structure/catalogue
  2. You should see ${result.length} root items in the Catalogue array
  3. Click "Publish" to promote the Draft to Published
     (frontend GROQ queries read from the published version by default)
  4. Run:  node scripts/build-catalogue-index.mjs
     to regenerate data/catalogue-index.json from the live data
`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

seedCatalogue().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
