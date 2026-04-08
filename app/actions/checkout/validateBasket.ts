"use server";

/**
 * validateBasket server action
 * Executes §5 processing pipeline: Sanity fetch → inventory reservation → Stripe session creation
 * Never throws to client - always returns typed result
 * Never calls redirect() - returns URL for client-side navigation
 */

import type { ValidateBasketResult, BasketPayload, StripeConfigDiscrepancy } from "./validateBasket.types";
import { sanityFetch } from "../../../sanity/lib/client";
import { checkoutClient } from "../../../sanity/lib/checkoutClient";
import { groq } from 'next-sanity';
import type { Product as SanityProduct } from "../../../sanity.types";
import { stripe } from "../../../lib/stripe/stripe";
import { TEST_CONFIG } from "../../../config/test";

// Product type for validation - includes stock and reservedStock fields
type ValidationProduct = Pick<SanityProduct, '_id' | 'name' | 'displayPrice' | 'stock' | 'reservedStock' | 'stripePriceId'>;

/**
 * Reserve inventory atomically
 * Returns 400 if stock unavailable, 200 if successful
 */
async function reserveInventory(
  items: BasketPayload['items'],
  idempotencyKey: string
): Promise<{ status: 200; reserved: Array<{ _id: string; quantity: number; stripePriceId: string }> } | { status: 400; unavailable: string[] }> {
  try {
    // First, fetch current stock and reservedStock for all items
    const productIds = items.map(item => item._id);

    const stockQuery = groq`*[_type == "product" && _id in $ids] {
      _id,
      stock,
      reservedStock,
      stripePriceId,
      reservations
    }`;

    const products: Pick<SanityProduct, '_id' | 'stock' | 'reservedStock' | 'stripePriceId' | 'reservations'>[] = await checkoutClient.fetch(
      stockQuery,
      { ids: productIds }
    );

    // Check availability and collect items to reserve
    const unavailable: string[] = [];
    const toReserve: Array<{ _id: string; quantity: number; revisionId: string; stripePriceId: string }> = [];

    for (const basketItem of items) {
      const product = products.find(p => p._id === basketItem._id);

      if (!product) {
        unavailable.push(basketItem._id);
        continue;
      }

      const availableStock = (product.stock || 0) - (product.reservedStock || 0);

      if (availableStock < basketItem.quantity) {
        unavailable.push(basketItem._id);
      } else {
        // Get revision ID for atomic update
        const productWithRevision = await checkoutClient.fetch(groq`*[_id == $id][0]{_rev}`, { id: basketItem._id });
        toReserve.push({
          _id: basketItem._id,
          quantity: basketItem.quantity,
          revisionId: productWithRevision?._rev || '',
          stripePriceId: product.stripePriceId || ''
        });
      }
    }

    if (unavailable.length > 0) {
      return { status: 400, unavailable };
    }

    // Atomically reserve stock for all items with test-friendly expiration
    const transaction = checkoutClient.transaction();
    const expiresAt = new Date(Date.now() + TEST_CONFIG.RESERVATION_EXPIRY_MS);

    for (const item of toReserve) {
      transaction.patch(item._id, (p) =>
        p
          .inc({ reservedStock: item.quantity })
          .append('reservations', [{
            idempotencyKey,
            quantity: item.quantity,
            expiresAt: expiresAt.toISOString(),
            status: 'active'
          }])
      );
    }

    await transaction.commit();

    return { status: 200, reserved: toReserve.map(r => ({ _id: r._id, quantity: r.quantity, stripePriceId: r.stripePriceId })) };

  } catch (error) {
    // Any error is treated as network/server error
    throw error;
  }
}

/**
 * Rollback inventory reservations
 */
async function rollbackReservations(reservedItems: Array<{ _id: string; quantity: number }>) {
  try {
    const transaction = checkoutClient.transaction();

    for (const item of reservedItems) {
      transaction.patch(item._id, (p) =>
        p
          .dec({ reservedStock: item.quantity })
      );
    }

    await transaction.commit();
  } catch (error) {
    console.error('Failed to rollback reservations:', error);
  }
}

export async function validateBasket(
  payload: BasketPayload,
  idempotencyKey: string,
  options?: { signal?: AbortSignal }
): Promise<ValidateBasketResult> {
  console.log('=== VALIDATE BASKET START ===');
  console.log('Idempotency Key:', idempotencyKey);
  console.log('Basket Items:', payload.items.length);
  console.log('Basket Total:', payload.total);

  let reservedItems: Array<{ _id: string; quantity: number }> = [];

  try {
    // Step 1: Fetch current products and stock
    console.log('\n--- Step 1: Fetch Products ---');
    const productIds = payload.items.map(item => item._id);
    console.log('Product IDs:', productIds);

    const query = groq`*[_type == "product" && _id in $ids] {
      _id,
      name,
      displayPrice,
      stock,
      stripePriceId
    }`;

    const products: ValidationProduct[] = await sanityFetch({
      query,
      params: { ids: productIds }
    });

    console.log('Products Found:', products.length);
    products.forEach(p => {
      console.log(`  - ${p.name}: $${p.displayPrice} (stock: ${p.stock})`);
    });

    // Step 2: Validate prices and stock
    console.log('\n--- Step 2: Validate Prices & Stock ---');
    // Calculate expected total based on current prices
    let expectedTotal = 0;
    for (const basketItem of payload.items) {
      const product = products.find(p => p._id === basketItem._id);

      if (!product) {
        console.log(`Product NOT FOUND: ${basketItem._id}`);
        return {
          outcome: "FAIL_VALIDATION",
          discrepancy: {
            type: "INVENTORY",
            items: [{
              id: basketItem._id,
              productName: `Product ${basketItem._id}`,
              available: 0,
              requested: basketItem.quantity
            }]
          }
        };
      }

      // Add this product's total to expected total
      expectedTotal += product.displayPrice * basketItem.quantity;
      console.log(`${product.name}: ${basketItem.quantity} × $${product.displayPrice} = $${product.displayPrice * basketItem.quantity}`);

      // Check stock shortage
      if (product.stock !== undefined && product.stock < basketItem.quantity) {
        console.log(`STOCK SHORTAGE: ${product.name}`);
        console.log(`  Available: ${product.stock}, Requested: ${basketItem.quantity}`);
        return {
          outcome: "FAIL_VALIDATION",
          discrepancy: {
            type: "INVENTORY",
            items: [{
              id: basketItem._id,
              productName: product.name || '',
              available: product.stock,
              requested: basketItem.quantity
            }]
          }
        };
      }
    }

    console.log(`Expected Total: $${expectedTotal}`);
    console.log(`Basket Total: $${payload.total}`);

    // Check if total matches
    if (expectedTotal !== payload.total) {
      console.log('PRICE MISMATCH DETECTED!');
      console.log(`Expected: $${expectedTotal}, Actual: $${payload.total}`);

      // Find which items have price discrepancies
      const discrepancyItems = [];
      for (const basketItem of payload.items) {
        const product = products.find(p => p._id === basketItem._id);
        if (product) {
          // Calculate what the basket thinks this item costs
          const basketPricePerItem = payload.total / payload.items.reduce((sum, item) => sum + item.quantity, 0);
          discrepancyItems.push({
            id: basketItem._id,
            productName: product.name || '',
            expected: product.displayPrice,
            actual: basketPricePerItem
          });
        }
      }

      return {
        outcome: "FAIL_VALIDATION",
        discrepancy: {
          type: "PRICE",
          items: discrepancyItems
        }
      };
    }

    console.log('Price validation: PASSED');

    // Step 3: Reserve inventory
    console.log('\n--- Step 3: Reserve Inventory ---');
    const reservationResult = await reserveInventory(payload.items, idempotencyKey);

    if (reservationResult.status === 400) {
      console.log('INVENTORY RESERVATION FAILED (400)');
      reservationResult.unavailable.forEach(id => {
        console.log(`  Unavailable: ${id}`);
      });
      return {
        outcome: "FAIL_VALIDATION",
        discrepancy: {
          type: "INVENTORY",
          items: reservationResult.unavailable.map(productId => ({
            id: productId,
            productName: `Product ${productId}`,
            available: 0,
            requested: payload.items.find(item => item._id === productId)?.quantity || 0
          }))
        }
      };
    }

    console.log('Inventory reservation: SUCCESS');
    reservedItems = payload.items.map(item => ({ _id: item._id, quantity: item.quantity }));
    console.log('Reserved items:', reservedItems);

    // Step 4: Create Stripe session
    console.log('\n--- Step 4: Create Stripe Session ---');

    const lineItems = payload.items.map(item => {
      const product = products.find(p => p._id === item._id);
      return {
        price: product?.stripePriceId || '',
        quantity: item.quantity
      };
    });

    // Check for missing price IDs
    const missingPriceIds = lineItems.filter(item => !item.price);
    if (missingPriceIds.length > 0) {
      console.log('MISSING STRIPE PRICE IDs');
      missingPriceIds.forEach((item, i) => {
        const product = products.find(p => p._id === payload.items[i]._id);
        console.log(`  - ${product?.name}: No price ID`);
      });
      await rollbackReservations(reservedItems);

      const discrepancy: StripeConfigDiscrepancy = {
        type: "STRIPE_CONFIG",
        items: [{
          id: "stripe",
          issue: "Order configuration error - missing Stripe price IDs"
        }]
      };

      return {
        outcome: "FAIL_VALIDATION",
        discrepancy: discrepancy as any
      };
    }

    console.log('Stripe line items:');
    lineItems.forEach((item, i) => {
      const product = products.find(p => p._id === payload.items[i]._id);
      console.log(`  - ${product?.name}: ${item.quantity} × ${item.price}`);
    });

    let session;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/checkout/return`,
        cancel_url: `${baseUrl}/basket?checkout=cancelled`,
        customer_email: undefined, // Will be set by client if user is logged in
        metadata: {
          idempotencyKey,
          items: payload.items.map(item => `${item._id}:${item.quantity}`).join(',')
        },
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      }, {
        idempotencyKey
      });
    } catch (stripeError) {
      console.error('Stripe session creation failed:', stripeError);
      await rollbackReservations(reservedItems);

      // Handle Stripe 400 errors as validation failures
      if (stripeError instanceof Error && stripeError.message.includes('400')) {
        const discrepancy: StripeConfigDiscrepancy = {
          type: "STRIPE_CONFIG",
          items: [{
            id: "stripe",
            issue: "Order configuration error"
          }]
        };

        return {
          outcome: "FAIL_VALIDATION",
          discrepancy: discrepancy as any
        };
      }

      // Other errors are treated as network errors
      throw stripeError;
    }

    console.log('Stripe session created:', session.url);
    console.log('\n=== VALIDATE BASKET SUCCESS ===');

    return {
      outcome: "PASS",
      stripeUrl: session.url || ''
    };

  } catch (error) {
    // Handle 5xx or network errors
    console.error('validateBasket error:', error);
    console.log('\n=== VALIDATE BASKET FAILED (NETWORK) ===');

    // Rollback any reservations if we got that far
    if (reservedItems.length > 0) {
      console.log('Rolling back reservations:', reservedItems);
      await rollbackReservations(reservedItems);
    }

    return { outcome: "FAIL_NETWORK" };
  }
}
