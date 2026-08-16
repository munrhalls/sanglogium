#!/usr/bin/env node

import fs from "node:fs";
import dotenv from "dotenv";
import { createClient } from "next-sanity";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_STUDIO_READ_WRITE;

if (!projectId || !token) {
  console.error("Missing env");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
  token,
});

const TINY_THRESHOLD = 200;

async function main() {
  const list = JSON.parse(fs.readFileSync("botched-headphones.json", "utf8"));
  const products = list.botched || [];

  let ok = true;
  for (const product of products) {
    const p = await client.fetch(
      `*[_type == "product" && slug.current == $slug][0]{
        name,
        "ref": image.asset._ref,
        "url": image.asset->url,
        "width": image.asset->metadata.dimensions.width,
        "height": image.asset->metadata.dimensions.height
      }`,
      { slug: product.slug }
    );

    if (!p) {
      console.error(`NOT FOUND: ${product.slug}`);
      ok = false;
      continue;
    }

    if (p.ref === product.imageAssetRef) {
      console.error(`STILL OLD ASSET: ${product.slug} -> ${p.ref}`);
      ok = false;
      continue;
    }

    if (!p.width || !p.height || p.width < TINY_THRESHOLD || p.height < TINY_THRESHOLD) {
      console.error(`TINY IMAGE: ${product.slug} -> ${p.width}x${p.height}`);
      ok = false;
      continue;
    }

    console.log(`OK: ${product.slug} -> ${p.width}x${p.height} -> ${p.url}`);
  }

  if (!ok) process.exit(1);
  console.log("\nALL VERIFIED");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
