// Check product stock values in Sanity
import { checkoutClient } from "./sanity/lib/checkoutClient.ts";
import { groq } from "next-sanity";

async function checkProductStock() {
  console.log('Checking product stock values...');

  const query = groq`*[_type == "product"][0..10] {
    _id,
    name,
    stock,
    reservedStock,
    displayPrice,
    stripePriceId
  }`;

  try {
    const products = await checkoutClient.fetch(query);
    console.log(`Found ${products.length} products`);

    products.forEach(product => {
      console.log(`\nProduct: ${product.name}`);
      console.log(`  ID: ${product._id}`);
      console.log(`  Stock: ${product.stock} (type: ${typeof product.stock})`);
      console.log(`  Reserved: ${product.reservedStock || 0}`);
      console.log(`  Available: ${(product.stock || 0) - (product.reservedStock || 0)}`);
      console.log(`  Price: ${product.displayPrice}`);
      console.log(`  Stripe ID: ${product.stripePriceId ? 'YES' : 'NO'}`);
    });

    // Summary
    const withStock = products.filter(p => typeof p.stock === 'number' && p.stock > 0);
    const withoutStock = products.filter(p => !p.stock || p.stock <= 0);

    console.log(`\n=== SUMMARY ===`);
    console.log(`With stock > 0: ${withStock.length}`);
    console.log(`Without stock: ${withoutStock.length}`);

  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

checkProductStock();
