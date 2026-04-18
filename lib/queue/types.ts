// Strict request/response types for the checkout queue skeleton.

export interface UIRequest {
  publicBasket: Array<{
    _id: string
    quantity: number
  }>
}

export interface UIResponse {
  ok: boolean
  requestId: string
  basketItemCount: number
  productId: string | null
  durationMs: number
}

export interface RedisQueueItem {
  id: string
  enqueuedAt: number
  payload: UIRequest
}

export interface CMSRequest {
  requestId: string
  query: string
}

export interface CMSResponse {
  requestId: string
  productId: string | null
  success: boolean
}

// Runtime guards used by the structure-fidelity log helper.
export function isUIRequest(v: unknown): v is UIRequest {
  if (typeof v !== 'object' || v === null) return false
  const keys = Object.keys(v)
  if (keys.length !== 1 || keys[0] !== 'publicBasket') return false
  const publicBasket = (v as { publicBasket: unknown }).publicBasket
  if (!Array.isArray(publicBasket)) return false
  if (publicBasket.length === 0) return false
  for (const item of publicBasket) {
    if (typeof item !== 'object' || item === null) return false
    const itemKeys = Object.keys(item)
    if (itemKeys.length !== 2) return false
    if (!itemKeys.includes('_id') || !itemKeys.includes('quantity')) return false
    const id = (item as { _id: unknown })._id
    const qty = (item as { quantity: unknown }).quantity
    if (typeof id !== 'string' || typeof qty !== 'number') return false
  }
  return true
}

export function isRedisQueueItem(v: unknown): v is RedisQueueItem {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.enqueuedAt === 'number' &&
    isUIRequest(o.payload)
  )
}

export function isCMSRequest(v: unknown): v is CMSRequest {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return typeof o.requestId === 'string' && typeof o.query === 'string'
}

export function isCMSResponse(v: unknown): v is CMSResponse {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.requestId === 'string' &&
    (o.productId === null || typeof o.productId === 'string') &&
    typeof o.success === 'boolean'
  )
}

export function isUIResponse(v: unknown): v is UIResponse {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.ok === 'boolean' &&
    typeof o.requestId === 'string' &&
    typeof o.basketItemCount === 'number' &&
    (o.productId === null || typeof o.productId === 'string') &&
    typeof o.durationMs === 'number'
  )
}
