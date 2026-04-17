// Shared Redis keys for checkout queue skeleton.
export const QUEUE_LIST_KEY = 'queue:checkout'
export const LOCK_KEY = 'lock:checkout:processing'
export const LOCK_TTL_SEC = 30
export const TRACE_LIST_KEY = 'trace:checkout-queue'
export const TRACE_MAX = 500
