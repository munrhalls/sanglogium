#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

async function verifyProductionCount() {
  console.log('Querying production dataset for baseline safety check...\n');

  const query = `count(*[_type == "product"])`;

  try {
    const count = await client.fetch(query);
    console.log(`Production dataset product count: ${count}`);
    console.log('✅ Baseline established');
    return count;
  } catch (error) {
    console.error('Failed to query production dataset:', error);
    process.exit(1);
  }
}

verifyProductionCount();
