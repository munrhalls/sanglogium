import { client } from "./sanity/lib/client.js";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function checkAndSyncProduct() {
  const productId = 'k27n1AQuIbSr5iozFz7EE4';
  
  console.log('=== Checking Product in Sanity ===');
  
  // Get product from Sanity
  const query = `*[_type == "product" && _id == $productId] {
    _id,
    name,
    stock,
    stripePriceId
  }`;
  
  try {
    const products = await client.fetch(query, { productId });
    
    if (products.length === 0) {
      console.log(`Product ${productId} not found in Sanity`);
      return;
    }
    
    const product = products[0];
    console.log('Product found:', {
      _id: product._id,
      name: product.name,
      stock: product.stock,
      stripePriceId: product.stripePriceId
    });
    
    // Check current Redis stock
    const currentStock = await redis.hget('product_stock', productId);
    console.log('Current Redis stock:', currentStock);
    
    // Sync to Redis if stock is defined
    if (typeof product.stock === 'number') {
      await redis.hset('product_stock', { [productId]: product.stock.toString() });
      console.log(`Synced stock ${product.stock} to Redis for product ${productId}`);
      
      // Verify
      const newStock = await redis.hget('product_stock', productId);
      console.log('Verified Redis stock:', newStock);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndSyncProduct();
