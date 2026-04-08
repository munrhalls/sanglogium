// Test-only configuration for faster, controlled tests
export const TEST_CONFIG = {
  // Use 3-second expiration for tests instead of 15 minutes
  RESERVATION_EXPIRY_MS: process.env.NODE_ENV === 'test' ? 3000 : 15 * 60 * 1000,
  
  // Use 1-second cleanup interval for tests
  CLEANUP_INTERVAL_MS: process.env.NODE_ENV === 'test' ? 1000 : 5 * 60 * 1000,
  
  // Test environment flag
  IS_TEST: process.env.NODE_ENV === 'test',
  
  // Mock Stripe for tests
  MOCK_STRIPE: process.env.NODE_ENV === 'test',
  
  // Test product IDs
  TEST_PRODUCTS: {
    ITEM_1: 'test-item-1',
    ITEM_2: 'test-item-2'
  }
} as const;
