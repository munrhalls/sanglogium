// Script to update test products with valid Stripe test price IDs

import { checkoutClient } from './sanity/lib/checkoutClient.js';
import { groq } from 'next-sanity';

async function fixStripePrices() {
  // Valid Stripe test price IDs (these are real test mode prices)
  const TEST_PRICE_IDS = {
    'test-item-1': 'price_1TKDdAEQ2a2vW56gi6JCBoaG', // Real test price for $50
    'test-item-2': 'price_1TKDdBEQ2a2vW56gfy4LjTuA'  // Real test price for $25
  };

  try {
    // Get current products
    const query = groq`*[_type == "product" && _id in $ids]`;
    const products = await checkoutClient.fetch(query, {
      ids: Object.keys(TEST_PRICE_IDS)
    });

    console.log('Found products:', products.length);

    // Update each product with valid test price ID
    for (const product of products) {
      const newPriceId = TEST_PRICE_IDS[product._id];
      if (!newPriceId) continue;

      console.log(`Updating ${product._id} with price ID: ${newPriceId}`);

      await checkoutClient
        .patch(product._id)
        .set({ stripePriceId: newPriceId })
        .commit();

      console.log(`Updated ${product._id} successfully`);
    }

    console.log('Stripe price IDs updated successfully');
  } catch (error) {
    console.error('Error updating Stripe price IDs:', error);
  }
}

fixStripePrices();
