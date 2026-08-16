#!/usr/bin/env node
// Patch broken accessory main images in Sanity with fetched replacement images.
// Reads broken-accessories-main-images.json (30 products with shared
// placeholder main images). For each product:
//   1. Normalizes the slug (strips /product/ prefix to match Sanity slug)
//   2. Finds the local replacement image file
//   3. Queries Sanity for the product _id by slug
//   4. Uploads the local image as a Sanity image asset
//   5. Patches the product image field to reference the new asset
//   6. Verifies the patch
//
// Usage:
//   node scripts/patch-broken-accessories-main-images.mjs             # real patch
//   node scripts/patch-broken-accessories-main-images.mjs --dry-run   # dry run
//
// Uses SANITY_STUDIO_READ_WRITE token (verified to have create permissions
// for asset upload + document patch).

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "next-sanity";

// Load env: .env.local first, then .env for any missing vars
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_STUDIO_READ_WRITE;

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  process.exit(1);
}
if (!token) {
  console.error("Missing SANITY_STUDIO_READ_WRITE token");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

const BASE_DIR = "fixing-botched-product-images";
const BROKEN_LIST_FILE = "broken-accessories-main-images.json";
const OUTPUT_MAPPING_FILE = "scripts/replacement-images-patched-result.json";

const DRY_RUN = process.argv.includes("--dry-run");
if (DRY_RUN) {
  console.log("=== DRY RUN MODE (no writes will be performed) ===\n");
} else {
  console.log(
    "=== LIVE PATCH MODE - writes to Sanity production dataset ===\n",
  );
}

// Normalize a catalog slug ("/product/foo-bar") to a Sanity slug ("foo-bar")
function normalizeSlug(slug) {
  return slug.replace(/^\/product\//, "");
}

// Find the local replacement image file for a slug
function findLocalImage(slug) {
  const dir = path.join(BASE_DIR, slug);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(slug + "."));
  if (files.length === 0) return null;
  return path.join(dir, files[0]);
}

async function getProduct(slug) {
  const result = await client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{ _id, name }`,
    { slug },
  );
  return result || null;
}

function makeResult(base, extra) {
  return { ...base, ...extra };
}

async function patchProduct(entry) {
  const { name, slug: rawSlug } = entry;
  const slug = normalizeSlug(rawSlug);
  const filePath = findLocalImage(slug);

  if (!filePath) {
    console.error("SKIP: no local replacement image for " + slug);
    return { name, slug, status: "NO_LOCAL_IMAGE" };
  }

  const product = await getProduct(slug);
  if (!product) {
    console.error("SKIP: product not found in Sanity for slug " + slug);
    return { name, slug, status: "PRODUCT_NOT_FOUND" };
  }

  const filename = path.basename(filePath);
  const stats = fs.statSync(filePath);
  console.log("");
  console.log("=== " + name + " ===");
  console.log("  slug: " + slug);
  console.log("  productId: " + product._id);
  console.log("  localImage: " + filePath + " (" + stats.size + " bytes)");

  if (DRY_RUN) {
    console.log(
      "  DRY RUN: would upload " + filename + " and patch " + product._id,
    );
    return { name, slug, productId: product._id, status: "DRY_RUN_OK" };
  }

  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, { filename });
  console.log("  uploaded asset: " + asset._id);

  await client
    .patch(product._id)
    .set({
      image: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      },
    })
    .commit();

  const updated = await client.fetch(
    `*[_type == "product" && _id == $_id][0]{
      "ref": image.asset._ref,
      "url": image.asset->url
    }`,
    { _id: product._id },
  );

  if (updated?.ref !== asset._id) {
    throw new Error(
      "Patch verification failed for " +
        slug +
        ": got " +
        updated?.ref +
        ", expected " +
        asset._id,
    );
  }

  console.log("  OK: pinned " + asset._id + " -> " + updated.url);
  return {
    name,
    slug,
    productId: product._id,
    localPath: filePath.replace(/\\/g, "/"),
    assetId: asset._id,
    sanityImageUrl: updated.url,
    status: "OK",
  };
}

async function main() {
  if (!fs.existsSync(BROKEN_LIST_FILE)) {
    console.error("Missing broken list: " + BROKEN_LIST_FILE);
    process.exit(1);
  }

  const list = JSON.parse(fs.readFileSync(BROKEN_LIST_FILE, "utf8"));
  if (!Array.isArray(list) || list.length === 0) {
    console.error("Broken list is empty or not an array.");
    process.exit(1);
  }

  console.log(
    "Loaded " + list.length + " products from " + BROKEN_LIST_FILE + "\n",
  );

  const results = [];
  for (const entry of list) {
    try {
      const result = await patchProduct(entry);
      results.push(result);
    } catch (err) {
      console.error("FAIL: " + entry.slug + " - " + err.message);
      results.push({
        name: entry.name,
        slug: entry.slug,
        status: "ERROR",
        error: err.message,
      });
    }
  }

  fs.writeFileSync(
    OUTPUT_MAPPING_FILE,
    JSON.stringify(results, null, 2),
    "utf8",
  );

  const ok = results.filter((r) => r.status === "OK").length;
  const dry = results.filter((r) => r.status === "DRY_RUN_OK").length;
  const failed = results.filter(
    (r) => r.status !== "OK" && r.status !== "DRY_RUN_OK",
  ).length;

  console.log("\n\n=== SUMMARY ===");
  if (DRY_RUN) {
    console.log("Ready to patch: " + dry + "/" + results.length);
  } else {
    console.log("Patched: " + ok + "/" + results.length);
  }
  if (failed > 0) {
    console.log("Failed/skipped: " + failed);
    for (const r of results.filter(
      (x) => x.status !== "OK" && x.status !== "DRY_RUN_OK",
    )) {
      console.log(
        "  - " + r.name + ": " + r.status + (r.error ? " - " + r.error : ""),
      );
    }
  }
  console.log("Mapping saved: " + OUTPUT_MAPPING_FILE);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
