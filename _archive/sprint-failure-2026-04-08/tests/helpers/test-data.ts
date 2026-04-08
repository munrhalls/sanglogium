import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env.local') });

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false
});

// Test product IDs
const TEST_PRODUCTS = {
  ITEM_1: 'test-item-1',
  ITEM_2: 'test-item-2'
};

// Helper functions
export async function getProductStock(productId: string): Promise<number> {
  const product = await client.fetch(`*[_id == $id][0]{stock}`, { id: productId });
  return product?.stock || 0;
}

export async function getProductReservedStock(productId: string): Promise<number> {
  const product = await client.fetch(`*[_id == $id][0]{reservedStock}`, { id: productId });
  return product?.reservedStock || 0;
}

export async function getProductReservations(productId: string): Promise<any[]> {
  const product = await client.fetch(`*[_id == $id][0]{reservations}`, { id: productId });
  return product?.reservations || [];
}

export async function createTestReservation(productId: string, quantity: number, expiresAt: Date): Promise<void> {
  await client.patch(productId)
    .append('reservations', [{
      idempotencyKey: `test-${Date.now()}-${Math.random()}`,
      quantity,
      expiresAt: expiresAt.toISOString(),
      status: 'active'
    }])
    .inc({ reservedStock: quantity })
    .commit();
}

export async function cleanupTestReservations(): Promise<void> {
  // Clean up any test reservations (both active and expired)
  // First get all products and filter manually
  const allProducts = await client.fetch(`*[_type == "product"]{_id, reservedStock, reservations}`);
  const products = allProducts.filter((p: any) =>
    p.reservations && p.reservations.some((r: any) => r.idempotencyKey?.startsWith('test-'))
  );

  const transaction = client.transaction();

  for (const product of products) {
    const testReservations = product.reservations.filter((r: any) => r.idempotencyKey?.startsWith('test-'));
    const activeTestReservations = testReservations.filter((r: any) => r.status === 'active');
    const totalQuantity = activeTestReservations.reduce((sum: number, r: any) => sum + r.quantity, 0);

    if (totalQuantity > 0) {
      transaction.patch(product._id, (p) =>
        p
          .dec({ reservedStock: totalQuantity })
          .setIfMissing({ reservations: [] })
          .set({
            reservations: product.reservations.filter((r: any) => !r.idempotencyKey?.startsWith('test-'))
          })
      );
    } else if (testReservations.length > 0) {
      // Just remove the test reservations without decrementing stock
      transaction.patch(product._id, (p) =>
        p
          .setIfMissing({ reservations: [] })
          .set({
            reservations: product.reservations.filter((r: any) => !r.idempotencyKey?.startsWith('test-'))
          })
      );
    }
  }

  await transaction.commit();
}

export async function resetTestProducts(): Promise<void> {
  // Reset test products to initial state
  const transaction = client.transaction();

  for (const productId of Object.values(TEST_PRODUCTS)) {
    transaction.patch(productId, (p) =>
      p
        .setIfMissing({ stock: 10 })
        .set({ reservedStock: 0 })
        .setIfMissing({ reservations: [] })
        .set({ reservations: [] })
    );
  }

  await transaction.commit();
}

export async function createTestProductsIfNotExists(): Promise<void> {
  // Create test products if they don't exist
  const transaction = client.transaction();

  for (const [name, id] of Object.entries(TEST_PRODUCTS)) {
    const exists = await client.fetch(`*[_id == $id][0]{_id}`, { id });

    if (!exists) {
      transaction.createIfNotExists({
        _id: id,
        _type: 'product',
        name: `Test Product ${name.split('_')[1]}`,
        displayPrice: 100,
        stock: 10,
        reservedStock: 0,
        stripePriceId: `price_test_${name.toLowerCase()}`,
        sku: `TEST-${name.toUpperCase()}`,
        reservations: [],
        catalogueLocationKeys: ['test-category']
      });
    }
  }

  await transaction.commit();
}

export { TEST_PRODUCTS };
