// Types and runtime guards for the unified checkout-queue (basket reservation).

export interface BasketReservation {
  publicBasket: Array<{
    _id: string
    quantity: number
    stripePriceId: string
  }>
  createdAt: string
}

export interface BasketReservationResponse {
  ok: true
  reservationId: string
  products: Array<{
    id: string
    realPrice: number
    reservedStock: number
    stock: number
  }>
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
  if (!Array.isArray(o.publicBasket) || o.publicBasket.length === 0) return false
  for (const item of o.publicBasket) {
    if (typeof item !== 'object' || item === null) return false
    const it = item as Record<string, unknown>
    if (typeof it._id !== 'string' || it._id.length === 0) return false
    if (typeof it.quantity !== 'number' || !Number.isFinite(it.quantity) || it.quantity < 1) return false
    if (typeof it.stripePriceId !== 'string' || it.stripePriceId.length === 0) return false
  }
  return true
}
