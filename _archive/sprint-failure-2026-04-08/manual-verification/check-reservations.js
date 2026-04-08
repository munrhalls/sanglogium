import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false
});

async function checkReservationStatus() {
  console.log('Checking current reservation status...\n');

  try {
    const products = await client.fetch(`*[_id in ["test-item-1", "test-item-2"]]{_id, name, stock, reservedStock, reservations}`);

    if (products.length === 0) {
      console.log('No test products found. Run setup-test-products.js first.');
      return;
    }

    for (const product of products) {
      console.log(`\n${product.name}:`);
      console.log(`  Stock: ${product.stock}`);
      console.log(`  Reserved: ${product.reservedStock}`);
      console.log(`  Available: ${product.stock - product.reservedStock}`);

      if (product.reservations && product.reservations.length > 0) {
        console.log('  Reservations:');
        product.reservations.forEach((r, i) => {
          const expires = new Date(r.expiresAt);
          const now = new Date();
          const isExpired = expires < now;
          console.log(`    ${i + 1}. Quantity: ${r.quantity}, Status: ${r.status}, Expires: ${expires.toLocaleString()} ${isExpired ? '(EXPIRED)' : ''}`);
        });
      } else {
        console.log('  No active reservations');
      }
    }

  } catch (error) {
    console.error('Error checking reservation status:', error);
    process.exit(1);
  }
}

// Run check
checkReservationStatus();
