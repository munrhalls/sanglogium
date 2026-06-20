import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID;

if (!projectId) {
  console.error("ERROR: Could not resolve Sanity project ID from env.");
  process.exit(1);
}

const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

console.log(`\n=== Sanity Client Config ===`);
console.log(`Project ID: ${projectId}`);
console.log(`Dataset:    ${dataset}`);
console.log(`API Version: ${apiVersion}`);
console.log(`Token:      ${process.env.SANITY_STUDIO_READ_WRITE ? "present" : "MISSING"}`);
console.log(`===========================\n`);

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

const IEM_VFS_KEY = "t2anvkkjfz9knqi85kozuaze";

// ─── Query A: Homepage IEM gallery ───────────────────────────────────────────

const queryA = `*[_type == "homepageData"][0].iemsGallery[]->{
  _id,
  name,
  "slug": slug.current,
  stock,
  catalogueLocationKeys
}`;

// ─── Query B: Products tagged with the IEM VFS key ────────────────────────────

const queryB = `*[_type == "product" && "${IEM_VFS_KEY}" in catalogueLocationKeys]{
  _id,
  name,
  "slug": slug.current,
  stock,
  catalogueLocationKeys
} | order(name asc)`;

// ─── Query C: All products with ANY IEM-related VFS keys ──────────────────────

const queryC = `*[_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys[@ match "*iem*" || @ match "*monitor*" || @ match "*ear*"]) > 0]{
  _id,
  name,
  "slug": slug.current,
  stock,
  catalogueLocationKeys
} | order(name asc)`;

function printProducts(label, products) {
  console.log(`\n--- ${label} ---`);
  console.log(`Total count: ${products.length}\n`);
  for (const p of products) {
    console.log(`  _id: ${p._id}`);
    console.log(`  name: ${p.name}`);
    console.log(`  slug: ${p.slug}`);
    console.log(`  stock: ${p.stock}`);
    console.log(`  catalogueLocationKeys: ${JSON.stringify(p.catalogueLocationKeys)}`);
    console.log(``);
  }
}

async function main() {
  // Run all three queries
  const [resultA, resultB, resultC] = await Promise.all([
    client.fetch(queryA),
    client.fetch(queryB),
    client.fetch(queryC),
  ]);

  printProducts("Query A — Homepage iemsGallery", resultA || []);
  printProducts("Query B — Products tagged with VFS key " + IEM_VFS_KEY, resultB || []);
  printProducts("Query C — Products with ANY IEM-related VFS keys", resultC || []);

  // ─── Intel Summary ─────────────────────────────────────────────────────────

  const galleryIds = new Set((resultA || []).map((p) => p._id));
  const queryBIds = new Set((resultB || []).map((p) => p._id));
  const queryCIds = new Set((resultC || []).map((p) => p._id));

  console.log(`\n=== INTEL SUMMARY ===\n`);

  // Q1
  console.log(`Q1: How many products are in the homepage iemsGallery?`);
  console.log(`    Answer: ${(resultA || []).length}\n`);

  // Q2
  console.log(`Q2: How many products are tagged with VFS key ${IEM_VFS_KEY} (monitors-iems)?`);
  console.log(`    Answer: ${(resultB || []).length}\n`);

  // Q3
  console.log(`Q3: Are the Query A products also in Query B (do the gallery items carry the correct VFS key)?`);
  for (const p of resultA || []) {
    const hasKey = (p.catalogueLocationKeys || []).includes(IEM_VFS_KEY);
    console.log(`    ${p.name} | has ${IEM_VFS_KEY}? ${hasKey ? "YES" : "NO"} | keys: ${JSON.stringify(p.catalogueLocationKeys)}`);
  }
  console.log(``);

  // Q4
  console.log(`Q4: Are there any IEM products from Query C that are NOT in Query B?`);
  const notInB = (resultC || []).filter((p) => !queryBIds.has(p._id));
  if (notInB.length === 0) {
    console.log(`    Answer: None — all IEM-tagged products use the current key`);
  } else {
    console.log(`    Answer: ${notInB.length} product(s) found:`);
    for (const p of notInB) {
      console.log(`      ${p.name} (${p.slug}) | keys: ${JSON.stringify(p.catalogueLocationKeys)}`);
    }
  }
  console.log(``);

  // Q5
  console.log(`Q5: If View All were fixed to /products/monitors-iems, would it show the same products as the homepage gallery?`);
  const galleryNotInB = (resultA || []).filter((p) => !queryBIds.has(p._id));
  if (galleryNotInB.length === 0) {
    console.log(`    Answer: YES (all gallery items are in Query B)`);
  } else {
    console.log(`    Answer: NO — these gallery items are NOT in Query B:`);
    for (const p of galleryNotInB) {
      console.log(`      ${p.name} (${p.slug})`);
    }
  }
  console.log(`\n=== END INTEL SUMMARY ===\n`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
