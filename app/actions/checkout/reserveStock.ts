'use server';

import { cookies } from 'next/headers';
import { client } from '@/sanity/lib/client';
import { stripe } from '@/lib/stripe';
import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';
import { logCheckoutEvent } from '@/lib/dev/event-logger';
import { checkStockReservationIntegrity, checkStockLevels } from '@/lib/dev/integrity-monitor';

// Redis client for stock reservations
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Sanity client
const sanityClient = client;

interface ReserveStockRequest {
  idempotencyKey: string;
  guestJwt?: string;
  sessionId: string;
  addressData: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  basketData: Array<{
    _id: string;
    quantity: number;
    stripePriceId: string;
  }>;
}

interface ReserveStockResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
  clientSecret?: string;
  reservationId?: string;
  expiresAt?: number;
}

// Redis Lua script for atomic stock reservation
const RESERVE_STOCK_SCRIPT = `
local productId = KEYS[1]
local quantity = tonumber(ARGV[1])
local reservationId = ARGV[2]
local ttl = tonumber(ARGV[3])

local stock = redis.call('HGET', 'product_stock', productId)
if not stock then
  return {err = "PRODUCT_NOT_FOUND"}
end

stock = tonumber(stock)
if stock < quantity then
  return {err = "INSUFFICIENT_STOCK"}
end

-- Reserve the stock
redis.call('HINCRBY', 'product_stock', productId, -quantity)
redis.call('HSET', 'reservations', reservationId, productId .. ':' .. quantity)
redis.call('EXPIRE', 'reservations', ttl)

return {ok = "RESERVED", stock}
`;

export async function reserveStock(request: ReserveStockRequest): Promise<ReserveStockResponse> {
  try {
    // Log start of address submission
    await logCheckoutEvent({
      correlationId: request.idempotencyKey,
      slice: 'address-submit',
      event: 'RESERVE_STOCK_START',
      data: { sessionId: request.sessionId, itemCount: request.basketData.length },
      outcome: 'success'
    });

    // Validate environment variables
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Redis configuration missing');
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe configuration missing');
    }
    // 1. Check idempotency cache
    const cached = await redis.get(`idempotency:${request.idempotencyKey}`);
    if (cached) {
      const cachedResult = JSON.parse(cached);
      return {
        success: true,
        clientSecret: cachedResult.clientSecret,
        reservationId: cachedResult.reservationId,
        expiresAt: cachedResult.expiresAt
      };
    }

    // 2. Validate basket locally first
    const basketValidation = await validateBasket(request.basketData);
    if (!basketValidation.valid) {
      return {
        success: false,
        error: {
          code: 'BASKET_VALIDATION_FAILED',
          message: basketValidation.error
        }
      };
    }

    // 3. Generate reservation ID
    const reservationId = `reserve_${randomUUID()}`;
    const ttl = 15 * 60; // 15 minutes

    // 4. Reserve stock with inline compensation tracking
    // Check + decrement in single pass; track for partial-failure inline rollback
    // Reservation record stored AFTER all items succeed (not before)
    const reserved: Array<{ id: string; quantity: number }> = [];

    for (const item of request.basketData) {
      let currentStock = await redis.hget('product_stock', item._id);

      // Sanity fallback: seed Redis from already-fetched Sanity products (cold miss)
      if (currentStock === null) {
        const sanityProduct = basketValidation.products?.find((p) => p._id === item._id);
        if (!sanityProduct?.stock) {
          for (const r of reserved) { await redis.hincrby('product_stock', r.id, r.quantity); }
          return { success: false, error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not available' } };
        }
        await redis.hset('product_stock', { [item._id]: sanityProduct.stock.toString() });
        currentStock = sanityProduct.stock.toString();
        console.log(`[reserveStock] Redis seeded from Sanity: ${item._id} = ${sanityProduct.stock}`);
      }

      if (parseInt(currentStock as string) < item.quantity) {
        for (const r of reserved) { await redis.hincrby('product_stock', r.id, r.quantity); }
        return { success: false, error: { code: 'INSUFFICIENT_STOCK', message: 'One or more items are out of stock' } };
      }

      await redis.hincrby('product_stock', item._id, -item.quantity);
      reserved.push({ id: item._id, quantity: item.quantity });
    }

    // Store reservation record AFTER all items successfully decremented
    const reservationItems = reserved.map(r => ({ productId: r.id, quantity: r.quantity }));
    await redis.hset('reservations', reservationId, JSON.stringify(reservationItems));
    await redis.expire('reservations', ttl);

    // Log successful stock reservation
    await logCheckoutEvent({
      correlationId: request.idempotencyKey,
      slice: 'address-submit',
      event: 'STOCK_RESERVED',
      data: { reservationId, items: reservationItems },
      outcome: 'success'
    });

    // Check stock reservation integrity
    await checkStockReservationIntegrity(request.idempotencyKey, reservationId, reservationItems);

    // Check stock levels are not negative
    await checkStockLevels(request.idempotencyKey, request.basketData.map(item => item._id));

    // 5. Calculate total amount
    const totalAmount = basketValidation.totalAmount;

    // 6. Create Stripe PaymentIntent with compensation pattern
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(
        {
          amount: totalAmount,
          currency: 'pln',
          automatic_payment_methods: { enabled: true },
          metadata: {
            reservationId,
            sessionId: request.sessionId
          },
        },
        { idempotencyKey: `pi_${request.idempotencyKey}` }
      );

      // Log successful PaymentIntent creation
      await logCheckoutEvent({
        correlationId: request.idempotencyKey,
        slice: 'address-submit',
        event: 'PAYMENT_INTENT_CREATED',
        data: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          reservationId,
          sessionId: request.sessionId
        },
        outcome: 'success'
      });
    } catch (stripeError) {
      // Log Stripe error
      await logCheckoutEvent({
        correlationId: request.idempotencyKey,
        slice: 'address-submit',
        event: 'PAYMENT_INTENT_FAILED',
        data: { error: String(stripeError), reservationId },
        outcome: 'error',
        error: String(stripeError)
      });

      // COMPENSATION: Release Redis reservation immediately
      await rollbackReservation(reservationId);

      return {
        success: false,
        error: {
          code: 'PAYMENT_SETUP_FAILED',
          message: 'Failed to setup payment method'
        }
      };
    }

    // 7. Store in guest session
    const guestSession = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      reservationId,
      expiresAt: Date.now() + (ttl * 1000),
      amountPln: totalAmount / 100, // Convert back from cents to PLN
      addressData: request.addressData,
      basketData: request.basketData
    };

    await redis.setex(
      `guest_session:${request.sessionId}`,
      ttl,
      JSON.stringify(guestSession)
    );

    // 8. Cache result with idempotency key
    const cacheData = {
      validationResult: basketValidation,
      reservationId,
      clientSecret: paymentIntent.client_secret,
      expiresAt: guestSession.expiresAt
    };

    await redis.setex(
      `idempotency:${request.idempotencyKey}`,
      ttl,
      JSON.stringify(cacheData)
    );

    // Log successful completion
    await logCheckoutEvent({
      correlationId: request.idempotencyKey,
      slice: 'address-submit',
      event: 'RESERVE_STOCK_COMPLETE',
      data: {
        reservationId,
        paymentIntentId: paymentIntent.id,
        expiresAt: guestSession.expiresAt,
        amountPln: guestSession.amountPln
      },
      outcome: 'success'
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      reservationId,
      expiresAt: guestSession.expiresAt
    };

  } catch (error) {
    console.error('Reserve stock error:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    };
  }
}

async function validateBasket(basketData: ReserveStockRequest['basketData']) {
  try {
    // Early validation: empty basket is invalid
    if (!basketData || basketData.length === 0) {
      return {
        valid: false,
        error: 'Basket is empty',
        totalAmount: 0
      };
    }

    // Fetch all products in basket
    const productIds = basketData.map(item => item._id);
    const products = await sanityClient.fetch(`
      *[_type == "product" && _id in $productIds] {
        _id,
        name,
        displayPrice,
        stock,
        stripePriceId,
        "images": images[].asset->url
      }
    `, { productIds });

    // Validate each item
    let totalAmount = 0;
    for (const basketItem of basketData) {
      const product = products.find(p => p._id === basketItem._id);

      if (!product) {
        return {
          valid: false,
          error: `Product ${basketItem._id} not found`,
          totalAmount: 0
        };
      }

      if (product.stock < basketItem.quantity) {
        return {
          valid: false,
          error: `Insufficient stock for ${product.name}`,
          totalAmount: 0
        };
      }

      if (product.stripePriceId !== basketItem.stripePriceId) {
        return {
          valid: false,
          error: `Price mismatch for ${product.name}`,
          totalAmount: 0
        };
      }

      totalAmount += product.displayPrice * basketItem.quantity;
    }

    return {
      valid: true,
      totalAmount: totalAmount * 100, // Convert to cents for Stripe
      products
    };

  } catch (error) {
    console.error('Basket validation error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate basket',
      totalAmount: 0
    };
  }
}

async function rollbackReservation(reservationId: string) {
  try {
    const reservationData = await redis.hget('reservations', reservationId);
    if (!reservationData) return;

    let items: Array<{ productId: string; quantity: number }>;
    try {
      items = JSON.parse(reservationData as string);
    } catch {
      // Legacy format: "productId:quantity"
      const [pid, qty] = (reservationData as string).split(':');
      items = [{ productId: pid, quantity: parseInt(qty) }];
    }

    for (const item of items) {
      if (item.productId && item.quantity) {
        await redis.hincrby('product_stock', item.productId, item.quantity);
      }
    }

    await redis.hdel('reservations', reservationId);
  } catch (error) {
    console.error('Rollback error:', error);
  }
}

// Helper function to get guest session
export async function getGuestSession(sessionId: string) {
  try {
    const session = await redis.get(`guest_session:${sessionId}`);
    if (!session) return null;

    // Handle both JSON string and object cases
    if (typeof session === 'string') {
      return JSON.parse(session);
    } else if (typeof session === 'object') {
      return session;
    }
    return null;
  } catch (error) {
    console.error('Get guest session error:', error);
    return null;
  }
}

// Helper function to clear guest session
export async function clearGuestSession(sessionId: string) {
  try {
    await redis.del(`guest_session:${sessionId}`);
  } catch (error) {
    console.error('Clear guest session error:', error);
  }
}
