#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "next-sanity";

// Load env: .env.local first, then .env for any missing public vars
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
const DRY_RUN = process.argv.includes("--dry-run");

async function getProductId(slug) {
  const result = await client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  return result?._id || null;
}

async function findLocalImage(slug) {
  const dir = path.join(BASE_DIR, slug);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(slug + "."));
  if (files.length === 0) return null;
  return path.join(dir, files[0]);
}

async function patchProduct(product) {
  const { name, slug } = product;
  const filePath = await findLocalImage(slug);

  if (!filePath) {
    console.error(`SKIP: no local image for ${slug}`);
    return;
  }

  const _id = await getProductId(slug);
  if (!_id) {
    console.error(`SKIP: product not found for slug ${slug}`);
    return;
  }

  const filename = path.basename(filePath);

  if (DRY_RUN) {
    console.log(`DRY RUN: would patch ${_id} (${slug}) with ${filename}`);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, { filename });

  await client
    .patch(_id)
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

  // Verify the patch
  const updated = await client.fetch(
    `*[_type == "product" && _id == $_id][0]{
      "ref": image.asset._ref,
      "url": image.asset->url
    }`,
    { _id }
  );

  if (updated?.ref !== asset._id) {
    throw new Error(`Patch verification failed for ${slug}: got ${updated?.ref}, expected ${asset._id}`);
  }

  console.log(`OK: ${slug} -> ${filename} -> ${asset._id} -> ${updated.url}`);
}

async function main() {
  const listPath = "botched-headphones.json";
  if (!fs.existsSync(listPath)) {
    console.error(`Missing botched list: ${listPath}`);
    process.exit(1);
  }

  const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
  const products = list.botched || [];

  if (products.length === 0) {
    console.log("No botched products to patch.");
    return;
  }

  for (const product of products) {
    try {
      await patchProduct(product);
    } catch (err) {
      console.error(`FAIL: ${product.slug} — ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
