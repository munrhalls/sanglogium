// Shared Redis keys for the unified checkout queue (basket reservation).
export const QUEUE_LIST_KEY = 'queue:checkout'
export const LOCK_KEY = 'lock:checkout:processing'
export const LOCK_TTL_SEC = 30
export const TRACE_LIST_KEY = 'trace:checkout-queue'
export const TRACE_MAX = 500

// Reservation TTL in seconds (15 minutes = 900 seconds)
// Use environment variable to allow shorter TTL for testing
export const RESERVATION_TTL_SEC = parseInt(process.env.RESERVATION_TTL_SEC || '900', 10)
