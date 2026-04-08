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

async function cleanupTestProducts() {
  console.log('Cleaning up test products...');

  try {
    // Find and delete test products
    const testProducts = await client.fetch(`*[_id in ["test-item-1", "test-item-2"]]{_id}`);

    if (testProducts.length === 0) {
      console.log('No test products found to clean up.');
      return;
    }

    // Delete the products
    await client.delete(testProducts.map(p => p._id));

    console.log(`Deleted ${testProducts.length} test products.`);
    console.log('Cleanup complete!');

  } catch (error) {
    console.error('Error cleaning up test products:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupTestProducts();
