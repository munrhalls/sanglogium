import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: "https://merry-sawfly-38178.upstash.io",
  token: "AZUiAAIncDFmMDQ5OTczZmFiOWM0NmY0OGFkNjg1NDY4MDZlOGE3ZHAxMzgxNzg",
});

async function debugStock() {
  console.log('=== Stock Debug ===');

  const productId = 'k27n1AQuIbSr5iozFz7EE4';

  // Check what's in Redis
  const stock = await redis.hget('product_stock', productId);
  console.log(`Redis stock for ${productId}:`, stock);
  console.log(`Type:`, typeof stock);

  // Check all product_stock keys
  const allStock = await redis.hgetall('product_stock');
  console.log('\nAll product_stock entries:');
  Object.entries(allStock).forEach(([id, value]) => {
    if (id === productId) {
      console.log(`  ${id}: ${value} <<< TARGET PRODUCT`);
    } else {
      console.log(`  ${id}: ${value}`);
    }
  });

  // Check if this product exists
  if (!stock) {
    console.log(`\nERROR: Product ${productId} not found in Redis product_stock!`);
  } else {
    const stockNum = parseInt(stock);
    console.log(`\nParsed stock value: ${stockNum}`);
    console.log(`Is NaN?:`, isNaN(stockNum));
  }
}

debugStock().catch(console.error);
