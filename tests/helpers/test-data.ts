import { createClient } from 'next-sanity';
import { client } from '../../sanity/lib/client';
import { apiVersion, dataset, projectId } from '../../sanity/env';

// Write-capable client for test setup (reset stock, etc). Uses the token with
// full update permission (verified via scripts/diagnose-sanity-tokens.mjs).
const testWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token:
    process.env.SANITY_STUDIO_READ_WRITE ||
    process.env.SANITY_STUDIO_READ_WRITE_CREATE,
});

export const TEST_PRODUCTS = [
  {
    _id: "YcMKSEyusPBTcaoe1xiP1b",
    name: "Test Product Alpha - Full Stock",
    stock: 5,
    reservedStock: 0,
    stripePriceId: "price_1TJU0HEQ2a2vW56g5nVkS96K",
    displayPrice: 10000
  },
  {
    _id: "MHd9dKrYZDArdj3morESVD",
    name: "Test Product Beta - Limited Stock",
    stock: 2,
    reservedStock:  0,
    stripePriceId: "price_1TJU0JEQ2a2vW56g2XSkjz7g",
    displayPrice: 20000
  }
];

export async function getTestProducts() {
  return client.fetch(`
    *[_type == "product" && (name match "test" || name match "Test")]{
      _id, name, stock, reservedStock, stripePriceId, slug, displayPrice
    } | order(name asc)
  `);
}

export async function resetProductStock(productId: string, initialStock: number) {
  await testWriteClient.patch(productId).set({ stock: initialStock, reservedStock: 0 }).commit();
}

export async function getProductStock(productId: string): Promise<number> {
  const product = await client.fetch(
    `*[_id == $productId]{stock}[0]`,
    { productId }
  );
  return product?.stock || 0;
}
