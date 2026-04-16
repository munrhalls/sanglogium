import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig, resetConfigCache } from '@/lib/checkout/reservation/config'

describe('loadConfig', () => {
  beforeEach(() => {
    // Clear config cache before each test
    resetConfigCache()
  })

  afterEach(() => {
    // Reset environment after each test
    delete process.env.GUEST_CHECKOUT_SANITY_PROJECT_ID
    delete process.env.GUEST_CHECKOUT_SANITY_DATASET
    delete process.env.GUEST_CHECKOUT_SANITY_TOKEN
    delete process.env.GUEST_CHECKOUT_REDIS_HOST
    delete process.env.GUEST_CHECKOUT_STRIPE_SECRET_KEY
  })

  it('should load config with all required fields', () => {
    process.env.GUEST_CHECKOUT_SANITY_PROJECT_ID = 'test-project'
    process.env.GUEST_CHECKOUT_SANITY_DATASET = 'test-dataset'
    process.env.GUEST_CHECKOUT_SANITY_TOKEN = 'sk_test_token'
    process.env.GUEST_CHECKOUT_REDIS_HOST = 'localhost'
    process.env.GUEST_CHECKOUT_STRIPE_SECRET_KEY = 'sk_test_stripe'

    const config = loadConfig()
    expect(config.GUEST_CHECKOUT_SANITY_PROJECT_ID).toBe('test-project')
    expect(config.GUEST_CHECKOUT_SANITY_DATASET).toBe('test-dataset')
    expect(config.GUEST_CHECKOUT_REDIS_HOST).toBe('localhost')
  })

  it('should use default values for optional fields', () => {
    process.env.GUEST_CHECKOUT_SANITY_PROJECT_ID = 'test-project'
    process.env.GUEST_CHECKOUT_SANITY_DATASET = 'test-dataset'
    process.env.GUEST_CHECKOUT_SANITY_TOKEN = 'sk_test_token'
    process.env.GUEST_CHECKOUT_REDIS_HOST = 'localhost'
    process.env.GUEST_CHECKOUT_STRIPE_SECRET_KEY = 'sk_test_stripe'

    const config = loadConfig()
    expect(config.GUEST_CHECKOUT_REDIS_PORT).toBe(6379)
    expect(config.GUEST_CHECKOUT_REDIS_DB).toBe(15)
    expect(config.GUEST_CHECKOUT_QUEUE_CONCURRENCY).toBe(5)
    expect(config.GUEST_CHECKOUT_RESERVATION_TTL).toBe(600)
  })

  it('should cache config after first load', () => {
    process.env.GUEST_CHECKOUT_SANITY_PROJECT_ID = 'test-project'
    process.env.GUEST_CHECKOUT_SANITY_DATASET = 'test-dataset'
    process.env.GUEST_CHECKOUT_SANITY_TOKEN = 'sk_test_token'
    process.env.GUEST_CHECKOUT_REDIS_HOST = 'localhost'
    process.env.GUEST_CHECKOUT_STRIPE_SECRET_KEY = 'sk_test_stripe'

    const config1 = loadConfig()
    const config2 = loadConfig()
    expect(config1).toBe(config2) // Same reference due to caching
  })

  it('should throw error when required fields are missing', () => {
    expect(() => loadConfig()).toThrow('Guest Checkout config validation failed')
  })

  it('should coerce string numbers to actual numbers', () => {
    process.env.GUEST_CHECKOUT_SANITY_PROJECT_ID = 'test-project'
    process.env.GUEST_CHECKOUT_SANITY_DATASET = 'test-dataset'
    process.env.GUEST_CHECKOUT_SANITY_TOKEN = 'sk_test_token'
    process.env.GUEST_CHECKOUT_REDIS_HOST = 'localhost'
    process.env.GUEST_CHECKOUT_STRIPE_SECRET_KEY = 'sk_test_stripe'
    process.env.GUEST_CHECKOUT_REDIS_PORT = '6380'

    const config = loadConfig()
    expect(config.GUEST_CHECKOUT_REDIS_PORT).toBe(6380)
    expect(typeof config.GUEST_CHECKOUT_REDIS_PORT).toBe('number')
  })
})
