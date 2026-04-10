"use server";

import { checkoutClient } from "@/sanity/lib/checkoutClient";
import { groq } from "next-sanity";

export async function verifyBasketStock(basket: Array<{_id: string, quantity: number}>) {
  console.log('=== Bus Stop 1: Verify Basket Stock ===');

  try {
    // Fetch current stock and reserved stock for all basket items
    const productIds = basket.map(item => item._id);

    const stockQuery = groq`*[_type == "product" && _id in $ids] {
      _id,
      name,
      stock,
      reservedStock,
      displayPrice
    }`;

    console.log('Fetching stock data for products:', productIds);

    const products = await checkoutClient.fetch(stockQuery, { ids: productIds });
    console.log('Stock data received:', products);

    // Verify each item
    const verificationResults = basket.map(basketItem => {
      const product = products.find(p => p._id === basketItem._id);

      if (!product) {
        console.log(`Product ${basketItem._id} no longer exists`);
        return {
          _id: basketItem._id,
          available: false,
          reason: 'Product no longer exists'
        };
      }

      const availableStock = (typeof product.stock === 'number' ? product.stock : 0) - (product.reservedStock || 0);
      const isAvailable = availableStock >= basketItem.quantity;

      console.log(`Product ${product.name}:`);
      console.log(`  - Stock: ${product.stock}`);
      console.log(`  - Reserved: ${product.reservedStock}`);
      console.log(`  - Available: ${availableStock}`);
      console.log(`  - Requested: ${basketItem.quantity}`);
      console.log(`  - Available: ${isAvailable ? 'YES' : 'NO'}`);

      return {
        _id: basketItem._id,
        name: product.name,
        available: isAvailable,
        requestedQuantity: basketItem.quantity,
        availableStock,
        currentPrice: product.displayPrice,
        reason: isAvailable ? 'Available' : `Insufficient stock (${availableStock} available)`
      };
    });

    const unavailableItems = verificationResults.filter(r => !r.available);
    const priceChanges = verificationResults.filter(r =>
      basket.find(item => item._id === r._id)?.displayPrice !== r.currentPrice
    );

    console.log('\n=== Verification Summary ===');
    console.log(`Total items: ${verificationResults.length}`);
    console.log(`Available: ${verificationResults.length - unavailableItems.length}`);
    console.log(`Unavailable: ${unavailableItems.length}`);
    console.log(`Price changes: ${priceChanges.length}`);

    if (unavailableItems.length > 0) {
      console.log('\nUnavailable items:');
      unavailableItems.forEach(item => {
        console.log(`  - ${item.name}: ${item.reason}`);
      });
    }

    if (priceChanges.length > 0) {
      console.log('\nPrice changes:');
      priceChanges.forEach(item => {
        const oldPrice = basket.find(b => b._id === item._id)?.displayPrice || 0;
        console.log(`  - ${item.name}: $${oldPrice} -> $${item.currentPrice}`);
      });
    }

    return {
      success: unavailableItems.length === 0,
      verificationResults,
      unavailableItems,
      priceChanges,
      message: unavailableItems.length === 0
        ? 'All items available'
        : `${unavailableItems.length} items no longer available`
    };

  } catch (error) {
    console.error('Stock verification failed:', error);
    return {
      success: false,
      verificationResults: [],
      unavailableItems: [],
      priceChanges: [],
      message: 'Failed to verify stock availability'
    };
  }
}
