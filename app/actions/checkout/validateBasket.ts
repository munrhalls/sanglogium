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

// Product type for validation - includes stock and reservedStock fields
type ValidationProduct = Pick<SanityProduct, '_id' | 'name' | 'displayPrice' | 'stock' | 'reservedStock' | 'stripePriceId'>;

/**
 * Reserve inventory atomically
 * Returns 400 if stock unavailable, 200 if successful
 */
async function reserveInventory(
  items: BasketPayload['items']
): Promise<{ status: 200; reserved: Array<{ _id: string; quantity: number; stripePriceId: string }> } | { status: 400; unavailable: string[] }> {
  try {
    // First, fetch current stock and reservedStock for all items
    const productIds = items.map(item => item._id);

    const stockQuery = groq`*[_type == "product" && _id in $ids] {
      _id,
      stock,
      reservedStock,
      stripePriceId
    }`;

    const products: Pick<SanityProduct, '_id' | 'stock' | 'reservedStock' | 'stripePriceId'>[] = await checkoutClient.fetch(
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

    // Atomically reserve stock for all items
    const transaction = checkoutClient.transaction();

    for (const item of toReserve) {
      transaction.patch(item._id, (p) =>
        p
          .setIfMissing({ reservedStock: 0 })
          .inc({ reservedStock: item.quantity })
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
          .setIfMissing({ reservedStock: 0 })
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
  let reservedItems: Array<{ _id: string; quantity: number }> = [];

  try {
    // Step 1: Fetch current prices and stock from Sanity
    const productIds = payload.items.map(item => item._id);

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

    // Step 2: Validate prices and stock
    for (const basketItem of payload.items) {
      const product = products.find(p => p._id === basketItem._id);

      if (!product) {
        // Product not found - treat as validation failure
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

      // Check price mismatch - calculate average price per item
      const totalQuantity = payload.items.reduce((sum, item) => sum + item.quantity, 0);
      const averagePricePerItem = totalQuantity > 0 ? payload.total / totalQuantity : 0;

      if (product.displayPrice !== averagePricePerItem) {
        return {
          outcome: "FAIL_VALIDATION",
          discrepancy: {
            type: "PRICE",
            items: [{
              id: basketItem._id,
              productName: product.name,
              expected: averagePricePerItem,
              actual: product.displayPrice
            }]
          }
        };
      }

      // Check stock shortage
      if (product.stock !== undefined && product.stock < basketItem.quantity) {
        return {
          outcome: "FAIL_VALIDATION",
          discrepancy: {
            type: "INVENTORY",
            items: [{
              id: basketItem._id,
              productName: product.name,
              available: product.stock,
              requested: basketItem.quantity
            }]
          }
        };
      }
    }

    // Step 3: Reserve inventory
    const reservationResult = await reserveInventory(payload.items);

    if (reservationResult.status === 400) {
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

    // Store reserved items for potential rollback
    reservedItems = reservationResult.reserved.map(r => ({ _id: r._id, quantity: r.quantity }));

    // Step 4: Create Stripe session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Build line items for Stripe
    const lineItems = reservationResult.reserved.map(item => ({
      price: item.stripePriceId,
      quantity: payload.items.find(bi => bi._id === item._id)?.quantity || 1
    }));

    // Validate that all items have stripePriceId
    const missingPriceIds = reservationResult.reserved.filter(item => !item.stripePriceId);
    if (missingPriceIds.length > 0) {
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

    let session;
    try {
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

    return {
      outcome: "PASS",
      stripeUrl: session.url
    };

  } catch (error) {
    // Handle 5xx or network errors
    console.error('validateBasket error:', error);

    // Rollback any reservations if we got that far
    if (reservedItems.length > 0) {
      await rollbackReservations(reservedItems);
    }

    return { outcome: "FAIL_NETWORK" };
  }
}
