// Strict request/response types for the checkout queue skeleton.

export interface UIRequest {
  n: number
}

export interface UIResponse {
  ok: boolean
  requestId: string
  n: number
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
  if (keys.length !== 1 || keys[0] !== 'n') return false
  const n = (v as { n: unknown }).n
  return typeof n === 'number' && Number.isFinite(n)
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
    typeof o.n === 'number' &&
    (o.productId === null || typeof o.productId === 'string') &&
    typeof o.durationMs === 'number'
  )
}
