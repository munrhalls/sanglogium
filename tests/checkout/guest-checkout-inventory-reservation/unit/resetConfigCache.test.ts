import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig, resetConfigCache } from '@/lib/checkout/reservation/config'

describe('resetConfigCache', () => {
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

  it('should clear the config cache', () => {
    // Set up environment
    process.env.GUEST_CHECKOUT_SANITY_PROJECT_ID = 'test-project'
    process.env.GUEST_CHECKOUT_SANITY_DATASET = 'test-dataset'
    process.env.GUEST_CHECKOUT_SANITY_TOKEN = 'sk_test_token'
    process.env.GUEST_CHECKOUT_REDIS_HOST = 'localhost'
    process.env.GUEST_CHECKOUT_STRIPE_SECRET_KEY = 'sk_test_stripe'

    // Load config to populate cache
    const config1 = loadConfig()

    // Reset cache
    resetConfigCache()

    // Load config again - should be a new instance
    const config2 = loadConfig()

    // Should have same values but different reference
    expect(config1.GUEST_CHECKOUT_SANITY_PROJECT_ID).toBe(config2.GUEST_CHECKOUT_SANITY_PROJECT_ID)
    expect(config1 === config2).toBe(false) // Different reference
  })

  it('should allow loading config with different values after reset', () => {
    // Set up initial environment
    process.env.GUEST_CHECKOUT_SANITY_PROJECT_ID = 'initial-project'
    process.env.GUEST_CHECKOUT_SANITY_DATASET = 'initial-dataset'
    process.env.GUEST_CHECKOUT_SANITY_TOKEN = 'sk_test_token'
    process.env.GUEST_CHECKOUT_REDIS_HOST = 'localhost'
    process.env.GUEST_CHECKOUT_STRIPE_SECRET_KEY = 'sk_test_stripe'

    // Load initial config
    const initialConfig = loadConfig()
    expect(initialConfig.GUEST_CHECKOUT_SANITY_PROJECT_ID).toBe('initial-project')

    // Reset cache
    resetConfigCache()

    // Change environment
    process.env.GUEST_CHECKOUT_SANITY_PROJECT_ID = 'new-project'

    // Load new config
    const newConfig = loadConfig()
    expect(newConfig.GUEST_CHECKOUT_SANITY_PROJECT_ID).toBe('new-project')
  })

  it('should not throw when cache is already empty', () => {
    // Cache should be empty from beforeEach
    expect(() => resetConfigCache()).not.toThrow()
  })
})
