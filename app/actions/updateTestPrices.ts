"use server";

// Server action to update test products with real Stripe price IDs

import { getBackendClient } from "../../sanity-cms/lib/backendClient";
import { groq } from 'next-sanity';

export async function updateTestProductPrices() {
  try {
    // Real Stripe test price IDs created
    const TEST_PRICE_IDS = {
      'test-item-1': 'price_1TKDdAEQ2a2vW56gi6JCBoaG', // $50.00
      'test-item-2': 'price_1TKDdBEQ2a2vW56gfy4LjTuA'  // $25.00
    };

    const backendClient = getBackendClient();

    // Update test-item-1
    console.log('Updating test-item-1...');
    await backendClient
      .patch('test-item-1')
      .set({ stripePriceId: TEST_PRICE_IDS['test-item-1'] })
      .commit();
    console.log('Updated test-item-1 successfully');

    // Update test-item-2
    console.log('Updating test-item-2...');
    await backendClient
      .patch('test-item-2')
      .set({ stripePriceId: TEST_PRICE_IDS['test-item-2'] })
      .commit();
    console.log('Updated test-item-2 successfully');

    console.log('\n=== Update Complete ===');
    console.log('Test products now have real Stripe test price IDs!');
    console.log('price_1TKDdAEQ2a2vW56gi6JCBoaG (test-item-1 - $50)');
    console.log('price_1TKDdBEQ2a2vW56gfy4LjTuA (test-item-2 - $25)');

    return { success: true, message: 'Test product prices updated successfully' };

  } catch (error) {
    console.error('Error updating test prices:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
