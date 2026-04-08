#!/usr/bin/env node
/**
 * Background job to clean expired reservations
 * Should be run every 5 minutes via cron or scheduler
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local') });

// Test configuration for faster cleanup in tests
const RESERVATION_EXPIRY_MS = process.env.NODE_ENV === 'test' ? 3000 : 15 * 60 * 1000;

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false
});

async function cleanExpiredReservations() {
  console.log('=== Starting Expired Reservation Cleanup ===');

  const now = new Date();
  console.log('Current time:', now.toISOString());

  // First check if test products exist
  const testProductsQuery = `*[_id in ["test-item-1", "test-item-2"]]{
    _id,
    name,
    stock,
    reservedStock,
    reservations
  }`;

  const testProducts = await client.fetch(testProductsQuery);
  console.log('Test products found:', testProducts.length);
  if (testProducts.length > 0) {
    console.log('Test product 1:', JSON.stringify(testProducts[0], null, 2));
  }

  // Find all products with expired reservations
  const query = `*[_type == "product"]{
    _id,
    name,
    stock,
    reservedStock,
    reservations
  }`;

  console.log('Query:', query);

  const allProducts = await client.fetch(query);
  console.log('All products found:', allProducts.length);

  // Filter for expired reservations in JavaScript
  const products = allProducts.filter(product => {
    return product.reservations && product.reservations.some(
      r => r.status === 'active' && new Date(r.expiresAt) < now
    );
  });

  console.log('Products with expired reservations:', products.length);

  if (products.length === 0) {
    console.log('No expired reservations found');
    return;
  }

  console.log(`Found ${products.length} products with expired reservations:`);

  let totalReleased = 0;
  const transaction = client.transaction();

  for (const product of products) {
    const expiredReservations = product.reservations.filter(
      r => r.status === 'active' && new Date(r.expiresAt) < now
    );

    if (expiredReservations.length === 0) continue;

    console.log(`\n${product.name}:`);

    let totalQuantityToRelease = 0;
    for (const reservation of expiredReservations) {
      const expiredAt = new Date(reservation.expiresAt);
      const minutesExpired = Math.floor((now.getTime() - expiredAt.getTime()) / (1000 * 60));

      console.log(`  - Releasing ${reservation.quantity} units (expired ${minutesExpired} minutes ago)`);
      console.log(`    IdempotencyKey: ${reservation.idempotencyKey}`);
      console.log(`    ExpiredAt: ${reservation.expiresAt}`);

      totalQuantityToRelease += reservation.quantity;
    }

    // Update the product
    transaction.patch(product._id, (p) =>
      p
        .dec({ reservedStock: totalQuantityToRelease })
        .set({
          reservations: product.reservations.map(r =>
            r.status === 'active' && new Date(r.expiresAt) < now
              ? { ...r, status: 'expired' }
              : r
          )
        })
    );

    totalReleased += totalQuantityToRelease;
  }

  if (totalReleased > 0) {
    await transaction.commit();
    console.log(`\n=== Cleanup Complete ===`);
    console.log(`Released ${totalReleased} total units from ${products.length} products`);
  } else {
    console.log('No reservations to release');
  }
}

// Run the cleanup
cleanExpiredReservations()
  .then(() => {
    console.log('Cleanup job completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup job failed:', error);
    process.exit(1);
  });
