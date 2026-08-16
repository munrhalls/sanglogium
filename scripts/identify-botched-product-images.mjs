#!/usr/bin/env node

import { createClient } from "next-sanity";
import dotenv from "dotenv";
import dns from "dns";

// Avoid Node getaddrinfo ENOTFOUND on Windows by preferring IPv4 A records.
dns.setDefaultResultOrder("ipv4first");

dotenv.config({ path: ".env" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

const PLACEHOLDER_RE = /skeletal|placeholder|blank|no[\s\-_]?image|missing|temp|test/i;
const TINY_THRESHOLD = 200; // px

function parseDimensions(ref) {
  const match = ref?.match(/-(\d+)x(\d+)-/);
  if (!match) return null;
  return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
}

async function resolveDescendantKeys(slug) {
  const items = await client.fetch(
    `*[_type == "catalogueItem"]{ _id, "slug": slug.current, "parentId": parent._ref }`
  );

  const bySlug = new Map();
  for (const item of items) {
    if (item.slug) bySlug.set(item.slug, item);
  }

  const target = bySlug.get(slug);
  if (!target) throw new Error(`Category slug not found: ${slug}`);

  const childrenMap = new Map();
  for (const item of items) {
    if (item.parentId) {
      if (!childrenMap.has(item.parentId)) childrenMap.set(item.parentId, []);
      childrenMap.get(item.parentId).push(item);
    }
  }

  const keySet = new Set();
  function collect(id) {
    keySet.add(id);
    for (const child of childrenMap.get(id) || []) collect(child._id);
  }
  collect(target._id);

  return Array.from(keySet);
}

async function fetchProducts(keys) {
  return client.fetch(
    `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
      name,
      "slug": slug.current,
      image {
        "assetRef": asset._ref,
        asset-> { _id, originalFilename }
      }
    }`,
    { keys }
  );
}

function inspectProduct(p) {
  const ref = p.image?.assetRef || p.image?.asset?._id || null;
  const originalFilename = p.image?.asset?.originalFilename || null;
  const dims = parseDimensions(ref);
  const reasons = [];

  if (!ref) reasons.push("missing-image");
  if (ref && !originalFilename) reasons.push("broken-asset-ref");
  if (originalFilename && PLACEHOLDER_RE.test(originalFilename)) {
    reasons.push("placeholder-filename");
  }
  if (dims && (dims.width < TINY_THRESHOLD || dims.height < TINY_THRESHOLD)) {
    reasons.push("tiny-image");
  }

  return {
    name: p.name,
    slug: p.slug,
    imageAssetRef: ref,
    originalFilename,
    dimensions: dims,
    reasons,
  };
}

async function main() {
  const slug = process.argv[2] || "headphones";
  const keys = await resolveDescendantKeys(slug);
  const products = await fetchProducts(keys);

  const inspected = products.map(inspectProduct);

  const refCounts = new Map();
  for (const p of inspected) {
    if (p.imageAssetRef) refCounts.set(p.imageAssetRef, (refCounts.get(p.imageAssetRef) || 0) + 1);
  }

  for (const p of inspected) {
    if (p.imageAssetRef && refCounts.get(p.imageAssetRef) > 2) {
      if (!p.reasons.includes("duplicate-asset")) p.reasons.push("duplicate-asset");
    }
  }

  const botched = inspected.filter((p) => p.reasons.length > 0);
  const result = {
    category: slug,
    total: inspected.length,
    botchedCount: botched.length,
    botched,
  };

  console.log(JSON.stringify(result, null, 2));
  console.error(`${slug}: ${inspected.length} products, ${botched.length} botched`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
