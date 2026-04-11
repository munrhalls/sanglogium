import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function populateTestStock() {
  console.log('=== Populating Test Stock Data ===');
  
  // Test stock data - just for the Marantz CD player and a few others
  const stockData = {
    'ZuUKzmkqDyQwdcwhxlIfVH': '106', // Marantz CD 60 CD Player
    '3O1ZNp54LWQGln4uEAU7Vs': '50',  // Test product 1
    '3O1ZNp54LWQGln4uEAUFVf': '25',  // Test product 2
  };
  
  try {
    // Clear existing product_stock data
    await redis.del('product_stock');
    console.log('Cleared existing product_stock in Redis');
    
    // Set test stock data
    await redis.hset('product_stock', stockData);
    console.log(`Populated ${Object.keys(stockData).length} products with stock`);
    
    // Verify the data
    console.log('\n=== Verification ===');
    for (const [id, stock] of Object.entries(stockData)) {
      const actual = await redis.hget('product_stock', id);
      console.log(`  ${id}: ${actual} (expected: ${stock}) ${actual === stock ? 'OK' : 'MISMATCH'}`);
    }
    
    console.log('\nDone! The checkout should now work.');
    
  } catch (error) {
    console.error('Error populating stock:', error);
  }
}

populateTestStock();
