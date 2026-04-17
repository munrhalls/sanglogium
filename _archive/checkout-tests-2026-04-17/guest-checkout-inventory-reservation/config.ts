// Configuration for Guest Checkout Inventory Reservation
// Shared constants and configuration for all tests

import { getRedisClient } from '@/lib/checkout/reservation/redis-client'

// Environment uses same Redis as production (single instance)
// Environment variables from .env.local:
// - GUEST_CHECKOUT_REDIS_HOST=localhost
// - GUEST_CHECKOUT_REDIS_PORT=6379

export function isTestEnvConfigured(): boolean {
  const hasSanityToken = !!process.env.SANITY_API_TOKEN
  const hasRedis = !!process.env.GUEST_CHECKOUT_REDIS_HOST
  return hasSanityToken && hasRedis
}

export function getSanityToken(): string | undefined {
  return process.env.SANITY_API_TOKEN
}

// Test timeouts (milliseconds)
export const TIMEOUTS = {
  queueProcessing: 5000,
  reservationComplete: 10000,
  stockVerification: 5000,
  circuitBreakerCooldown: 35000, // 30s + buffer
} as const

// Test product IDs
export const TEST_PRODUCT_IDS = {
  highStock: 'test-product-high-stock',
  lowStock: 'test-product-low-stock',
  outOfStock: 'test-product-out-of-stock',
  singleItem: 'test-product-single-item',
} as const

// Expected TTL values (seconds)
export const TTL_VALUES = {
  stockLock: 300,        // 5 minutes
  reservation: 600,    // 10 minutes
  idempotency: 86400,    // 24 hours
} as const

// Circuit breaker configuration
export const CIRCUIT_BREAKER = {
  failureThreshold: 5,
  cooldownMs: 30000,
} as const

// Retry configuration
export const RETRY_CONFIG = {
  create: 3,
  rollback: 10,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
} as const

// Rate limiting
export const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60000, // 1 minute
} as const

// Test dataset configuration
export function getTestRedisClient() {
  return getRedisClient()
}

// Helper to reset test environment
export async function resetTestEnvironment(): Promise<void> {
  const redis = getTestRedisClient()
  // Delete all keys (single Redis instance)
  await redis.flushdb()
  console.log('Test environment reset: Redis flushed')
}
