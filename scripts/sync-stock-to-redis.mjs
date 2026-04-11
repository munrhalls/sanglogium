import { client } from "../sanity/lib/client.ts";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function syncStockToRedis() {
  console.log('=== Syncing Stock from Sanity to Redis ===');

  // Get all products with stock
  const query = `*[_type == "product" && defined(stock)] {
    _id,
    name,
    stock
  }`;

  try {
    const products = await client.fetch(query);
    console.log(`Found ${products.length} products with stock data`);

    // Clear existing product_stock data
    await redis.del('product_stock');
    console.log('Cleared existing product_stock in Redis');

    // Populate Redis with stock data
    const stockData = {};
    let synced = 0;

    for (const product of products) {
      if (typeof product.stock === 'number' && product.stock > 0) {
        stockData[product._id] = product.stock.toString();
        synced++;
      }
    }

    // Set all stock data in one operation
    if (Object.keys(stockData).length > 0) {
      await redis.hset('product_stock', stockData);
      console.log(`Synced ${synced} products to Redis`);
    }

    // Verify a few entries
    console.log('\n=== Verification ===');
    const testIds = [
      'ZuUKzmkqDyQwdcwhxlIfVH', // Marantz CD player
      '3O1ZNp54LWQGln4uEAU7Vs', // Test product 1
      '3O1ZNp54LWQGln4uEAUFVf'  // Test product 2
    ];

    for (const id of testIds) {
      const stock = await redis.hget('product_stock', id);
      console.log(`  ${id}: ${stock || 'NOT FOUND'}`);
    }

    console.log('\nDone!');

  } catch (error) {
    console.error('Error syncing stock:', error);
  }
}

syncStockToRedis();
