// ============================================================================
// ⚠️  LEGACY - DEPRECATED - NO LONGER USED IN ACTIVE CHECKOUT FLOW ⚠️
// ============================================================================
// This checkout-queue system is LEGACY and NOT part of the current checkout implementation.
// 
// Current checkout flow uses:
//   - iron-session for state management (no queue)
//   - Direct Sanity API calls (no Redis queue)
//   - See: app/actions/checkout/index.ts
//
// DO NOT use this code for new features. It exists only for:
//   - Historical reference
//   - Legacy test compatibility
//   - Potential future audit needs
//
// To delete safely: Remove all files in lib/queue/, app/api/checkout-queue/, tests/checkout-queue/
// ============================================================================

// Shared Redis keys for the unified checkout queue (basket reservation).
export const QUEUE_LIST_KEY = 'queue:checkout'
export const LOCK_KEY = 'lock:checkout:processing'
export const LOCK_TTL_SEC = 30
export const TRACE_LIST_KEY = 'trace:checkout-queue'
export const TRACE_MAX = 500

// Reservation TTL in seconds (15 minutes = 900 seconds)
// Use environment variable to allow shorter TTL for testing
export const RESERVATION_TTL_SEC = parseInt(process.env.RESERVATION_TTL_SEC || '900', 10)
