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

const targetIds = [
  "x2LkzHeaGqoEz8JhogbfHu",
  "GqkAHteRmu9rQ6VLnVzrzY",
];

const targetNames = {
  "x2LkzHeaGqoEz8JhogbfHu": "JBL Charge 6 Portable Bluetooth Speaker (Black)",
  "GqkAHteRmu9rQ6VLnVzrzY": "Polk Audio RC80I 2 Way In Ceiling Speakers - 4 Pack (White)",
};

async function main() {
  let allGood = true;
  for (const id of targetIds) {
    console.log(`\n--- ${targetNames[id]} (${id}) ---`);
    const doc = await client.fetch(`*[_id == $id][0]`, { id });
    if (doc) {
      console.log(`❌ Document STILL EXISTS: ${doc.name}`);
      allGood = false;
    } else {
      console.log("✅ Document is gone");
    }

    const refCount = await client.fetch(`count(*[references($id)])`, { id });
    if (refCount > 0) {
      const refs = await client.fetch(`*[references($id)]{_id, _type}[0...10]`, { id });
      console.log(`⚠️  ${refCount} references found:`);
      refs.forEach(r => console.log(`  - ${r._id} (${r._type})`));
      allGood = false;
    } else {
      console.log("✅ No references found");
    }
  }

  if (!allGood) {
    throw new Error("\nVerification failed: at least one product still exists or has references");
  }
  console.log("\n✅ All deleted products are gone and have no references.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
