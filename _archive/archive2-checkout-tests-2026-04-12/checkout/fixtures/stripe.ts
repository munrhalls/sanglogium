/**
 * Stripe Test Fixtures
 * 
 * Test card numbers from Stripe documentation:
 * https://docs.stripe.com/testing
 * 
 * DO NOT use real card numbers in tests.
 * These are Stripe's official test card numbers.
 */

export const TEST_CARDS = {
  // Success scenarios
  VISA_SUCCESS: '4242424242424242',
  MASTERCARD_SUCCESS: '5555555555554444',
  AMEX_SUCCESS: '378282246310005',
  
  // Decline scenarios
  DECLINE_GENERIC: '4000000000000002',
  DECLINE_INSUFFICIENT_FUNDS: '4000000000009995',
  DECLINE_LOST_CARD: '4000000000009987',
  DECLINE_STOLEN_CARD: '4000000000009979',
  DECLINE_EXPIRED: '4000000000000069',
  DECLINE_INCORRECT_CVC: '4000000000000127',
  DECLINE_PROCESSING_ERROR: '4000000000000119',
  DECLINE_SUSPECTED_FRAUD: '4100000000000019',
  
  // Special scenarios
  REQUIRE_3DS: '4000002500003155',
  ALWAYS_3DS: '4000002760003184',
  OFFLINE_PIN_REQUIRED: '4000020000002365',
  OFFLINE_PIN_FAIL: '4000020000002381',
  
  // Dispute scenarios
  DISPUTE_FRAUDULENT: '4000000000000259',
  DISPUTE_UNRECOGNIZED: '4000000000002685',
  DISPUTE_INQUIRY: '4000000000001976',
} as const;

export const TEST_CARD_METADATA = {
  [TEST_CARDS.VISA_SUCCESS]: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2030 },
  [TEST_CARDS.DECLINE_GENERIC]: { brand: 'visa', last4: '0002', decline_code: 'card_declined' },
  [TEST_CARDS.DECLINE_INSUFFICIENT_FUNDS]: { brand: 'visa', last4: '9995', decline_code: 'insufficient_funds' },
  [TEST_CARDS.DECLINE_EXPIRED]: { brand: 'visa', last4: '0069', decline_code: 'expired_card' },
  [TEST_CARDS.DECLINE_INCORRECT_CVC]: { brand: 'visa', last4: '0127', decline_code: 'incorrect_cvc' },
} as const;

// Webhook event fixtures
export const WEBHOOK_EVENTS = {
  checkout_session_completed: {
    id: 'evt_test_checkout_session_completed',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_session_123',
        object: 'checkout.session',
        status: 'complete',
        payment_status: 'paid',
        amount_total: 2000,
        currency: 'pln',
        customer_details: {
          email: 'test@example.com',
          name: 'Test User',
        },
        metadata: {
          productsIntent: 'prod_123:2,prod_456:1',
          clerkUserId: 'guest',
        },
        payment_intent: 'pi_test_123',
      },
    },
  },
  
  checkout_session_expired: {
    id: 'evt_test_checkout_session_expired',
    object: 'event',
    type: 'checkout.session.expired',
    data: {
      object: {
        id: 'cs_test_session_expired',
        object: 'checkout.session',
        status: 'expired',
        metadata: {
          productsIntent: 'prod_123:2',
          clerkUserId: 'guest',
        },
      },
    },
  },
  
  checkout_session_async_payment_failed: {
    id: 'evt_test_async_payment_failed',
    object: 'event',
    type: 'checkout.session.async_payment_failed',
    data: {
      object: {
        id: 'cs_test_session_failed',
        object: 'checkout.session',
        status: 'open',
        payment_status: 'unpaid',
        metadata: {
          productsIntent: 'prod_123:1',
          clerkUserId: 'guest',
        },
      },
    },
  },
} as const;

// FSM test scenarios
export const FSM_SCENARIOS = {
  happy_path: [
    { state: 'idle', event: 'CHECKOUT_CLICK', expected: 'processing' },
    { state: 'processing', event: 'SUCCESS', expected: 'complete' },
  ],
  
  error_recovery: [
    { state: 'idle', event: 'CHECKOUT_CLICK', expected: 'processing' },
    { state: 'processing', event: 'ERROR', expected: 'idle' },
    { state: 'idle', event: 'PAYMENT_SUBMIT', expected: 'processing' },
    { state: 'processing', event: 'SUCCESS', expected: 'complete' },
  ],
  
  retry_after_decline: [
    { state: 'idle', event: 'PAYMENT_SUBMIT', expected: 'processing' },
    { state: 'processing', event: 'ERROR', expected: 'idle' },
    { state: 'idle', event: 'PAYMENT_SUBMIT', expected: 'processing' },
    { state: 'processing', event: 'SUCCESS', expected: 'complete' },
  ],
  
  restart_after_complete: [
    { state: 'idle', event: 'CHECKOUT_CLICK', expected: 'processing' },
    { state: 'processing', event: 'SUCCESS', expected: 'complete' },
    { state: 'complete', event: 'CHECKOUT_CLICK', expected: 'idle' },
  ],
} as const;

// Network error scenarios for MSW
export const NETWORK_ERRORS = {
  timeout: { message: 'Request timeout', code: 'ETIMEDOUT' },
  connection_reset: { message: 'Connection reset', code: 'ECONNRESET' },
  dns_failure: { message: 'DNS lookup failed', code: 'ENOTFOUND' },
  stripe_500: { status: 500, message: 'Internal server error' },
  stripe_429: { status: 429, message: 'Rate limit exceeded' },
  stripe_400_invalid_request: { status: 400, message: 'Invalid request' },
} as const;

// API response fixtures
export const API_RESPONSES = {
  create_payment_intent: {
    success: {
      client_secret: 'pi_test_secret_123',
      id: 'pi_test_123',
      status: 'requires_confirmation',
    },
    invalid_amount: {
      error: { code: 'amount_too_small', message: 'Amount must be at least 1 PLN' },
    },
    invalid_currency: {
      error: { code: 'invalid_currency', message: 'Invalid currency: XYZ' },
    },
  },
  
  confirm_payment: {
    success: {
      id: 'pi_test_123',
      status: 'succeeded',
      charges: { data: [{ id: 'ch_test_123', status: 'succeeded' }] },
    },
    card_declined: {
      error: { 
        code: 'card_declined', 
        decline_code: 'generic_decline',
        message: 'Your card was declined.',
      },
    },
    authentication_required: {
      error: {
        code: 'authentication_required',
        message: 'This transaction requires 3D Secure authentication.',
      },
    },
  },
} as const;
