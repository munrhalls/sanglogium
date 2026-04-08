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

async function setupTestProducts() {
  console.log('Creating test products for manual verification...');

  const testProducts = [
    {
      _type: 'product',
      _id: 'test-item-1',
      name: 'Test Product 1',
      slug: { current: 'test-item-1' },
      price: 50,
      displayPrice: 50,
      stock: 10,
      reservedStock: 0,
      status: 'active',
      image: null,
      description: 'Test product for manual verification of reservation system',
      categories: ['test-category'],
      brand: 'Test Brand',
      stripePriceId: 'price_1O9K7z2eZvKYlo2C8s9qX2Y9' // Mock price ID
    },
    {
      _type: 'product',
      _id: 'test-item-2',
      name: 'Test Product 2',
      slug: { current: 'test-item-2' },
      price: 25,
      displayPrice: 25,
      stock: 10,
      reservedStock: 0,
      status: 'active',
      image: null,
      description: 'Second test product for manual verification of reservation system',
      categories: ['test-category'],
      brand: 'Test Brand',
      stripePriceId: 'price_1O9K8A2eZvKYlo2C8t7rW3Z8' // Mock price ID
    }
  ];

  try {
    // Clean up any existing test products first
    console.log('Cleaning up existing test products...');
    const existingProducts = await client.fetch(`*[_id in ["test-item-1", "test-item-2"]]{_id}`);

    if (existingProducts.length > 0) {
      await client.delete(existingProducts.map(p => p._id));
      console.log('Deleted existing test products');
    }

    // Create new test products
    console.log('Creating new test products...');
    const transaction = client.transaction();

    for (const product of testProducts) {
      transaction.createOrReplace(product);
    }

    await transaction.commit();
    console.log('Test products created successfully!');
    console.log('\nTest Products Ready:');
    console.log('- Test Product 1: http://localhost:3000/product/test-item-1');
    console.log('- Test Product 2: http://localhost:3000/product/test-item-2');
    console.log('\nBoth products have 10 stock units available.');

  } catch (error) {
    console.error('Error setting up test products:', error);
    process.exit(1);
  }
}

// Run setup
setupTestProducts();
