// Types and runtime guards for the unified checkout-queue (basket reservation).

// Client basket (input from frontend) - includes stripePriceId and displayPrice for verification
export interface ClientBasketItem {
  _id: string
  quantity: number
  stripePriceId: string
  displayPrice: number
}

// CMS basket reservation (saved to Sanity) - includes verifiedPrice, no stripePriceId
export interface CmsBasketReservationItem {
  _id: string
  quantity: number
  verifiedPrice: number
}

export interface BasketReservation {
  basketReservation: Array<ClientBasketItem>
  createdAt: string
}

export interface BasketReservationResponse {
  ok: true
  reservationId: string
  ttl: number
  products: Array<{
    id: string
    realPrice: number
    reservedStock: number
    stock: number
  }>
  debug?: {
    stripeVerification: Array<{
      productId: string
      stripePriceId: string
      verifiedPrice: number
    }>
  }
}

export interface RedisQueueItem {
  id: string
  enqueuedAt: number
  payload: BasketReservation
}

export function isBasketReservation(v: unknown): v is BasketReservation {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  if (typeof o.createdAt !== 'string' || o.createdAt.length === 0) return false
  if (!Array.isArray(o.basketReservation) || o.basketReservation.length === 0) return false
  for (const item of o.basketReservation) {
    if (typeof item !== 'object' || item === null) return false
    const it = item as Record<string, unknown>
    if (typeof it._id !== 'string' || it._id.length === 0) return false
    if (typeof it.quantity !== 'number' || !Number.isFinite(it.quantity) || it.quantity < 1) return false
    if (typeof it.stripePriceId !== 'string' || it.stripePriceId.length === 0) return false
    if (typeof it.displayPrice !== 'number' || !Number.isFinite(it.displayPrice) || it.displayPrice < 0) return false
  }
  return true
}
