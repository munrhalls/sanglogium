"use server";

import { checkoutClient } from "@/sanity/lib/checkoutClient";
import { groq } from "next-sanity";
import { centsToDisplay } from "@/lib/utils/price";

// Helper function to convert price_data to display price
function convertToDisplayPrice(product: any): number {
  return centsToDisplay(product.price_data.unit_amount);
}

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
      price_data
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
      const currentPrice = convertToDisplayPrice(product);

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
        currentPrice,
        reason: isAvailable ? 'Available' : `Insufficient stock (${availableStock} available)`
      };
    });

    const unavailableItems = verificationResults.filter(r => !r.available);

    console.log('\n=== Verification Summary ===');
    console.log(`Total items: ${verificationResults.length}`);
    console.log(`Available: ${verificationResults.length - unavailableItems.length}`);
    console.log(`Unavailable: ${unavailableItems.length}`);

    if (unavailableItems.length > 0) {
      console.log('\nUnavailable items:');
      unavailableItems.forEach(item => {
        console.log(`  - ${item.name}: ${item.reason}`);
      });
    }

    return {
      success: unavailableItems.length === 0,
      verificationResults,
      unavailableItems,
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
      message: 'Failed to verify stock availability'
    };
  }
}
