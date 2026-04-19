// Atomic basket reservation processor.
// Separate parallel implementation from the checkout-queue skeleton to keep
// scope simple (no modifications to existing working code).
//
// Flow:
//   1. Validate BasketReservation shape (400 on mismatch).
//   2. RPUSH to dedicated Redis FIFO list.
//   3. Spin loop: SET NX lock + head check (LINDEX) -> only head proceeds.
//   4. Create Sanity basketReservation doc with deterministic _id = requestId.
//   5. Increment reservedStock for each product atomically via transaction.
//   6. Fetch updated products and build BasketReservationResponse.
//   7. LPOP + DEL lock.

import { randomUUID } from 'node:crypto'
import { getQueueRedis } from './redis'
import { startHealthInterval } from './health'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import type { BasketReservation, BasketReservationResponse } from './types'

const reservationWriteToken =
  process.env.SANITY_STUDIO_READ_WRITE ||
  process.env.SANITY_STUDIO_READ_WRITE_CREATE

const reservationClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: reservationWriteToken,
})

const BR_QUEUE_KEY = 'queue:basket-reservation'
const BR_LOCK_KEY = 'lock:basket-reservation:processing'
const BR_LOCK_TTL_SEC = 30
const BR_TRACE_KEY = 'trace:basket-reservation'
const BR_TRACE_MAX = 500

export interface BRTraceEntry {
  event: string
  requestId: string
  ts: number
  payload?: Record<string, unknown>
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

async function trace(
  event: string,
  requestId: string,
  payload?: Record<string, unknown>
): Promise<void> {
  const entry: BRTraceEntry = {
    event,
    requestId,
    ts: Date.now(),
    ...(payload ? { payload } : {}),
  }
  console.log(`BR_TRACE: ${event}`, { requestId, ...(payload || {}) })
  try {
    const redis = getQueueRedis()
    await redis.lpush(BR_TRACE_KEY, JSON.stringify(entry))
    await redis.ltrim(BR_TRACE_KEY, 0, BR_TRACE_MAX - 1)
  } catch (err) {
    console.error('BR_TRACE sink write failed', err)
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export interface BRResult {
  status: 202 | 400 | 500
  body: BasketReservationResponse | { ok: false; error: string }
}

export async function processBasketReservation(raw: unknown): Promise<BRResult> {
  startHealthInterval()

  if (!isBasketReservation(raw)) {
    return { status: 400, body: { ok: false, error: 'Invalid BasketReservation' } }
  }

  const request = raw
  const requestId = randomUUID()
  const start = Date.now()

  await trace('request received', requestId, { itemCount: request.publicBasket.length })

  const redis = getQueueRedis()
  const queueItem = { id: requestId, enqueuedAt: Date.now(), payload: request }
  const queueItemStr = JSON.stringify(queueItem)
  await redis.rpush(BR_QUEUE_KEY, queueItemStr)
  await trace('queued', requestId)

  const deadline = start + 45_000
  while (true) {
    if (Date.now() > deadline) {
      await redis.lrem(BR_QUEUE_KEY, 1, queueItemStr)
      return { status: 500, body: { ok: false, error: 'Queue wait timeout' } }
    }
    const got = await redis.set(BR_LOCK_KEY, requestId, { nx: true, ex: BR_LOCK_TTL_SEC })
    if (got !== 'OK') {
      await sleep(25)
      continue
    }
    const headRaw = await redis.lindex(BR_QUEUE_KEY, 0)
    if (!headRaw) {
      await redis.del(BR_LOCK_KEY)
      await sleep(25)
      continue
    }
    const head =
      typeof headRaw === 'string'
        ? (JSON.parse(headRaw) as { id: string })
        : (headRaw as { id: string })
    if (head.id !== requestId) {
      await redis.del(BR_LOCK_KEY)
      await sleep(25)
      continue
    }
    break
  }

  try {
    await trace('processing', requestId)

    const doc = await reservationClient.create({
      _id: requestId,
      _type: 'basketReservation',
      publicBasket: request.publicBasket.map((p, i) => ({
        _key: `${p._id}-${i}`,
        _id: p._id,
        quantity: p.quantity,
        stripePriceId: p.stripePriceId,
      })),
      createdAt: request.createdAt,
    })

    await trace('reservation document created', requestId, { docId: doc._id })

    const tx = reservationClient.transaction()
    for (const item of request.publicBasket) {
      tx.patch(item._id, (p) => p.inc({ reservedStock: item.quantity }))
    }
    await tx.commit()

    await trace('reservedStock incremented', requestId)

    const productIds = request.publicBasket.map((p) => p._id)
    const products = (await reservationClient.fetch(
      `*[_id in $ids]{ _id, stock, reservedStock, displayPrice }`,
      { ids: productIds }
    )) as Array<{ _id: string; stock: number; reservedStock: number; displayPrice: number }>

    const response: BasketReservationResponse = {
      ok: true,
      reservationId: doc._id,
      products: products.map((p) => ({
        id: p._id,
        realPrice: p.displayPrice,
        reservedStock: p.reservedStock,
        stock: p.stock,
      })),
    }

    await redis.lpop(BR_QUEUE_KEY)
    await redis.del(BR_LOCK_KEY)
    await trace('complete', requestId, { durationMs: Date.now() - start })

    return { status: 202, body: response }
  } catch (err) {
    try {
      await redis.lpop(BR_QUEUE_KEY)
    } catch {
      /* ignore */
    }
    await redis.del(BR_LOCK_KEY)
    const message = err instanceof Error ? err.message : String(err)
    await trace('error', requestId, { error: message })
    return { status: 500, body: { ok: false, error: message } }
  }
}

export async function getBasketReservationTrace(): Promise<BRTraceEntry[]> {
  const redis = getQueueRedis()
  const raw = await redis.lrange(BR_TRACE_KEY, 0, -1)
  return raw
    .map((r) => (typeof r === 'string' ? (JSON.parse(r) as BRTraceEntry) : (r as BRTraceEntry)))
    .reverse()
}
