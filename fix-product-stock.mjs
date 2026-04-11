import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function fixProductStock() {
  const productId = 'k27n1AQuIbSr5iozFz7EE4';
  
  console.log('=== Fixing Product Stock in Redis ===');
  
  // Set stock to 10 for this product
  const stock = 10;
  await redis.hset('product_stock', { [productId]: stock.toString() });
  console.log(`Set stock ${stock} for product ${productId}`);
  
  // Verify
  const currentStock = await redis.hget('product_stock', productId);
  console.log('Verified Redis stock:', currentStock);
  
  // Check all products
  const allStock = await redis.hgetall('product_stock');
  console.log('\nAll products in Redis:');
  Object.entries(allStock).forEach(([id, value]) => {
    console.log(`  ${id}: ${value}`);
  });
}

fixProductStock().catch(console.error);
