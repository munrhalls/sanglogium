"use server";

import { BasketItem } from "@/app/(store)/basket/basket.types";
import { centsToDisplay } from "@/lib/utils/price";

interface BasketTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  breakdown: {
    subtotal: number;
    shipping: {
      method: string;
      cost: number;
    };
    tax: {
      rate: number;
      amount: number;
    };
  };
}

export async function calculateBasketTotals(basket: BasketItem[]): Promise<BasketTotals> {
  console.log('=== Bus Stop 1: Calculate Basket Totals ===');
  
  // Calculate subtotal from price_data
  const subtotal = basket.reduce((sum, item) => {
    const displayPrice = centsToDisplay(item.price_data.unit_amount);
    return sum + (displayPrice * item.quantity);
  }, 0);
  console.log(`Subtotal: $${subtotal.toFixed(2)} from ${basket.length} items`);
  
  // Calculate shipping (simplified logic - could be based on weight, location, etc.)
  let shippingCost = 0;
  let shippingMethod = 'standard';
  
  if (subtotal > 0) {
    // Free shipping for orders over $100
    if (subtotal >= 100) {
      shippingCost = 0;
      shippingMethod = 'free';
    } else if (subtotal >= 50) {
      shippingCost = 9.99;
      shippingMethod = 'express';
    } else {
      shippingCost = 15.99;
      shippingMethod = 'standard';
    }
  }
  
  console.log(`Shipping: $${shippingCost.toFixed(2)} (${shippingMethod})`);
  
  // Calculate tax (simplified - could be based on location, tax rules, etc.)
  const taxRate = 0.08; // 8% tax rate (could vary by state/country)
  const taxableAmount = subtotal + shippingCost;
  const tax = taxableAmount * taxRate;
  
  console.log(`Tax: $${tax.toFixed(2)} at ${(taxRate * 100).toFixed(1)}% on $${taxableAmount.toFixed(2)}`);
  
  // Calculate total
  const total = subtotal + shippingCost + tax;
  
  console.log(`Total: $${total.toFixed(2)}`);
  
  const result: BasketTotals = {
    subtotal,
    shipping: shippingCost,
    tax,
    total,
    breakdown: {
      subtotal,
      shipping: {
        method: shippingMethod,
        cost: shippingCost
      },
      tax: {
        rate: taxRate,
        amount: tax
      }
    }
  };
  
  console.log('\n=== Totals Breakdown ===');
  console.log(`Items: ${basket.length}`);
  console.log(`Subtotal: $${result.breakdown.subtotal.toFixed(2)}`);
  console.log(`Shipping (${result.breakdown.shipping.method}): $${result.breakdown.shipping.cost.toFixed(2)}`);
  console.log(`Tax (${(result.breakdown.tax.rate * 100).toFixed(1)}%): $${result.breakdown.tax.amount.toFixed(2)}`);
  console.log(`Total: $${result.total.toFixed(2)}`);
  
  return result;
}
