import { createClient } from 'next-sanity';
import { apiVersion, projectId, dataset } from '../../sanity-cms/env';

// Read client for test dataset
const testClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

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

export async function getTestProducts() {
  return testClient.fetch(`
    *[_type == "product" && (name match "test" || name match "Test")]{
      _id, name, stock, reservedStock, slug, price_data
    } | order(name asc)
  `);
}

export async function resetProductStock(productId: string, initialStock: number) {
  // Check if product exists before trying to patch it
  const product = await testClient.fetch(`*[_id == $productId]{_id}[0]`, { productId });
  if (!product) {
    console.log(`Product ${productId} not found in dataset, skipping stock reset`);
    return;
  }
  await testWriteClient.patch(productId).set({ stock: initialStock, reservedStock: 0 }).commit();
}

export async function getProductStock(productId: string): Promise<number> {
  const product = await testClient.fetch(
    `*[_id == $productId]{stock}[0]`,
    { productId }
  );
  return product?.stock || 0;
}
