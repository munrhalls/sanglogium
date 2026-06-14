#!/usr/bin/env node

/**
 * Migration: Reset reservedStock to 0 on all product documents.
 *
 * Uses a single Sanity transaction with targeted patch mutations.
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ─── Configuration ──────────────────────────────────────────────────────────

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = "2024-01-01";
const TOKEN = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN;

if (!TOKEN) {
  throw new Error("Missing required environment variable: SANITY_STUDIO_READ_WRITE or SANITY_API_TOKEN");
}

// ─── Client ─────────────────────────────────────────────────────────────────

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  useCdn: false,
  token: TOKEN,
});

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Fetch only the IDs of products that need fixing
  const query = '*[_type == "product" && defined(reservedStock) && reservedStock > 0]._id';
  const ids = await client.fetch(query);

  console.log(`Found ${ids.length} product(s) with reservedStock > 0`);

  if (ids.length === 0) {
    console.log("Migration complete — nothing to fix.");
    return;
  }

  // 2. Build a transaction with one patch per ID
  const transaction = client.transaction();

  for (const id of ids) {
    transaction.patch(id, (p) => p.set({ reservedStock: 0 }));
  }

  // 3. Commit the transaction
  await transaction.commit();

  console.log(`Migration complete — reset reservedStock to 0 for ${ids.length} product(s).`);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
