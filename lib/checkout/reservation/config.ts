// Guest Checkout Inventory Reservation - Environment Configuration
// Validates and loads all required + optional environment variables with GUEST_CHECKOUT_ prefix

import { z } from 'zod'

// ============================================================================
// Zod Schema for Environment Variables
// ============================================================================

const envSchema = z.object({
  // Database & CMS
  GUEST_CHECKOUT_SANITY_PROJECT_ID: z.string().min(1),
  GUEST_CHECKOUT_SANITY_DATASET: z.string().min(1),
  GUEST_CHECKOUT_SANITY_TOKEN: z.string().min(1),

  // Redis
  GUEST_CHECKOUT_REDIS_HOST: z.string().min(1),
  GUEST_CHECKOUT_REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
  GUEST_CHECKOUT_REDIS_PASSWORD: z.string().optional(),
  GUEST_CHECKOUT_REDIS_DB: z.coerce.number().int().min(0).max(15).default(0),
  GUEST_CHECKOUT_REDIS_USE_TLS: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),

  // Stripe
  GUEST_CHECKOUT_STRIPE_SECRET_KEY: z.string().min(1),
  GUEST_CHECKOUT_STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Queue
  GUEST_CHECKOUT_QUEUE_CONCURRENCY: z.coerce.number().int().min(1).max(100).default(5),
  GUEST_CHECKOUT_QUEUE_MAX_RETRIES: z.coerce.number().int().min(0).max(20).default(3),

  // TTL
  GUEST_CHECKOUT_RESERVATION_TTL: z.coerce.number().int().min(60).max(3600).default(600),
  GUEST_CHECKOUT_IDEMPOTENCY_TTL: z.coerce.number().int().min(3600).max(172800).default(86400),

  // Logging
  GUEST_CHECKOUT_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  GUEST_CHECKOUT_LOG_FORMAT: z.enum(['json', 'text']).default('json'),

  // Monitoring
  GUEST_CHECKOUT_HEALTH_CHECK_INTERVAL: z.coerce.number().int().default(30000),
  GUEST_CHECKOUT_CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().int().min(1).max(100).default(5),
  GUEST_CHECKOUT_CIRCUIT_BREAKER_TIMEOUT: z.coerce.number().int().default(30000),

  // Development
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type GuestCheckoutConfig = z.infer<typeof envSchema>

// ============================================================================
// Config Loading
// ============================================================================

let cachedConfig: GuestCheckoutConfig | null = null

export function loadConfig(): GuestCheckoutConfig {
  if (cachedConfig) return cachedConfig

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const missing = result.error.issues.map(i => i.path.join('.')).join(', ')
    throw new Error(`Guest Checkout config validation failed. Issues: ${missing}`)
  }

  cachedConfig = result.data
  return cachedConfig
}

export function resetConfigCache(): void {
  cachedConfig = null
}

// ============================================================================
// Secret Masking for Logs
// ============================================================================

export function maskSecret(value: string): string {
  if (value.startsWith('sk_')) {
    return value.substring(0, 7) + '***MASKED***'
  }
  if (value.startsWith('whsec_')) {
    return value.substring(0, 10) + '***MASKED***'
  }
  if (value.startsWith('sk-')) {
    return value.substring(0, 3) + '***MASKED***'
  }
  return value
}

// ============================================================================
// Config Getters
// ============================================================================

export function getRedisConfig() {
  const config = loadConfig()
  return {
    host: config.GUEST_CHECKOUT_REDIS_HOST,
    port: config.GUEST_CHECKOUT_REDIS_PORT,
    password: config.GUEST_CHECKOUT_REDIS_PASSWORD,
    db: config.GUEST_CHECKOUT_REDIS_DB,
    tls: config.GUEST_CHECKOUT_REDIS_USE_TLS ? {} : undefined,
  }
}

export function getReservationTTL(): number {
  return loadConfig().GUEST_CHECKOUT_RESERVATION_TTL
}

export function getIdempotencyTTL(): number {
  return loadConfig().GUEST_CHECKOUT_IDEMPOTENCY_TTL
}

export function getCircuitBreakerConfig() {
  const config = loadConfig()
  return {
    threshold: config.GUEST_CHECKOUT_CIRCUIT_BREAKER_THRESHOLD,
    timeout: config.GUEST_CHECKOUT_CIRCUIT_BREAKER_TIMEOUT,
  }
}
