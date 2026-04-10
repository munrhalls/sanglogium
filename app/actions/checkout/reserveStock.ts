'use server';

import { cookies } from 'next/headers';
import { client } from 'sanity/lib/client';
import { stripe } from '@/lib/stripe';
import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';

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

    // 4. Reserve stock for each item (simplified without Lua script for now)
    const reservationPromises = request.basketData.map(async (item) => {
      // Check current stock
      const stock = await redis.hget('product_stock', item._id);
      if (!stock || parseInt(stock) < item.quantity) {
        return { err: 'INSUFFICIENT_STOCK' };
      }

      // Reserve stock
      await redis.hincrby('product_stock', item._id, -item.quantity);
      await redis.hset('reservations', reservationId, `${item._id}:${item.quantity}`);
      await redis.expire('reservations', ttl);

      return { ok: 'RESERVED', stock: parseInt(stock) - item.quantity };
    });

    const reservationResults = await Promise.all(reservationPromises);

    // Check if any reservation failed
    for (const result of reservationResults) {
      if (result.err) {
        // Rollback any successful reservations
        await rollbackReservation(reservationId);

        if (result.err === 'INSUFFICIENT_STOCK') {
          return {
            success: false,
            error: {
              code: 'INSUFFICIENT_STOCK',
              message: 'One or more items are out of stock'
            }
          };
        }

        return {
          success: false,
          error: {
            code: 'STOCK_RESERVATION_FAILED',
            message: 'Failed to reserve stock'
          }
        };
      }
    }

    // 5. Calculate total amount
    const totalAmount = basketValidation.totalAmount;

    // 6. Create Stripe PaymentIntent with compensation pattern
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          reservationId,
          sessionId: request.sessionId
        },
        idempotencyKey: `pi_${request.idempotencyKey}`
      });
    } catch (stripeError) {
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
      reservationId,
      expiresAt: Date.now() + (ttl * 1000),
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
        message: 'An unexpected error occurred'
      }
    };
  }
}

async function validateBasket(basketData: ReserveStockRequest['basketData']) {
  try {
    // Fetch all products in basket
    const productIds = basketData.map(item => item._id);
    const products = await sanityClient.fetch(`
      *[_type == "product" && _id in $productIds] {
        _id,
        name,
        price,
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

      totalAmount += product.price * basketItem.quantity;
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
      error: 'Failed to validate basket',
      totalAmount: 0
    };
  }
}

async function rollbackReservation(reservationId: string) {
  try {
    // Get reservation details
    const reservationData = await redis.hget('reservations', reservationId);
    if (!reservationData) return;

    // Parse and release stock
    const [productId, quantity] = reservationData.split(':');
    await redis.hincrby('product_stock', productId, parseInt(quantity));

    // Remove reservation
    await redis.hdel('reservations', reservationId);

  } catch (error) {
    console.error('Rollback error:', error);
  }
}

// Helper function to get guest session
export async function getGuestSession(sessionId: string) {
  try {
    const session = await redis.get(`guest_session:${sessionId}`);
    return session ? JSON.parse(session) : null;
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
