import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function verifyStock() {
  console.log('=== Verifying Stock Data ===');
  
  const productId = 'ZuUKzmkqDyQwdcwhxlIfVH';
  
  try {
    // Check the actual value
    const stock = await redis.hget('product_stock', productId);
    console.log(`Stock for ${productId}:`, stock);
    console.log(`Type:`, typeof stock);
    console.log(`Value as number:`, parseInt(stock));
    
    // Test the actual logic from reserveStock
    const itemQuantity = 1; // Assuming quantity 1
    const currentStock = parseInt(stock);
    const hasStock = currentStock >= itemQuantity;
    
    console.log(`\nStock check test:`);
    console.log(`  Current stock: ${currentStock}`);
    console.log(`  Required: ${itemQuantity}`);
    console.log(`  Has stock: ${hasStock}`);
    
    // Check all product_stock
    const allStock = await redis.hgetall('product_stock');
    console.log(`\nTotal products in Redis: ${Object.keys(allStock).length}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyStock();
