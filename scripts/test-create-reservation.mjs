#!/usr/bin/env node

import { createClient } from "next-sanity";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "test",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

async function testCreate() {
  console.log('Creating test basket reservation in test dataset...\n');

  const reservation = await writeClient.create({
    _type: "basketReservation",
    basketReservation: [
      {
        _id: "test-product-id",
        quantity: 1,
        verifiedPrice: 100,
      },
    ],
    createdAt: new Date().toISOString(),
  });

  console.log(`✅ Created reservation with ID: ${reservation._id}`);
  
  // Verify it exists
  const doc = await writeClient.fetch(`*[_id == $id][0]`, { id: reservation._id });
  console.log(`✅ Document exists:`, doc);
  
  // Cleanup
  await writeClient.delete(reservation._id);
  console.log(`✅ Deleted test document`);
}

testCreate().catch(console.error);
