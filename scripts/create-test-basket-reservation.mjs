#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: "test",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

async function createTestBasketReservation() {
  console.log('Creating test basket reservation in test dataset...\n');

  // Fetch one test product to use in reservation
  const productQuery = `*[_type == "product" && name match "Test"][0]{
    _id,
    stripePriceId,
    displayPrice
  }`;

  try {
    const product = await client.fetch(productQuery);
    
    if (!product) {
      console.error('No test product found. Run copy-products-to-test-dataset.mjs first.');
      process.exit(1);
    }

    console.log(`Using test product: ${product._id} (Price: ${product.displayPrice})\n`);

    const reservation = {
      _type: "basketReservation",
      basketReservation: [
        {
          _id: product._id,
          quantity: 1,
          verifiedPrice: product.displayPrice
        }
      ],
      createdAt: new Date().toISOString()
    };

    const result = await client.create(reservation);
    console.log(`✅ Created basket reservation with ID: ${result._id}`);
    console.log(`Reservation ID: ${result._id}`);
  } catch (error) {
    console.error('Failed to create basket reservation:', error);
    process.exit(1);
  }
}

createTestBasketReservation();
