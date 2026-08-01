#!/usr/bin/env node

import { createClient } from "next-sanity";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0 && !key.startsWith("#")) {
    process.env[key.trim()] = valueParts.join("=").trim();
  }
});

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_STUDIO_READ_WRITE;

if (!projectId || !token) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_STUDIO_READ_WRITE");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

const targets = [
  {
    display: "JBL Charge 6 Portable Bluetooth Speaker (Black)",
    namePattern: "Charge 6*",
    price: 19995,
  },
  {
    display: "Polk Audio RC80i 2 Way In Ceiling Speakers - 4 Pack (White)",
    namePattern: "RC80*",
    price: 49800,
  },
];

async function main() {
  for (const t of targets) {
    console.log(`\n--- ${t.display} ---`);
    const products = await client.fetch(
      `*[_type == "product" && name match $pattern && price_data.unit_amount == $price]{_id, name, "price": price_data.unit_amount, "brand": brand->name}[0...10]`,
      { pattern: t.namePattern, price: t.price }
    );

    if (products.length === 0) {
      throw new Error(`No product found for: ${t.display}`);
    }
    if (products.length > 1) {
      throw new Error(
        `Multiple products matched for: ${t.display}\n${JSON.stringify(
          products,
          null,
          2
        )}`
      );
    }

    const product = products[0];
    console.log(`Found: ${product._id} — ${product.name} — ${product.price} — brand: ${product.brand}`);

    console.log(`Deleting ${product._id}...`);
    await client.delete(product._id);
    console.log(`Deleted ${product._id}`);

    const check = await client.fetch(`*[_id == $id][0]`, { id: product._id });
    if (check) {
      throw new Error(`Product ${product._id} still exists after deletion`);
    }
    console.log(`Verified: ${product._id} is gone`);
  }

  console.log("\n✅ Both products deleted and verified.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
