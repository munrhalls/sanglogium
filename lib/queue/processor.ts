// Unified checkout-queue processor.
//
// Flow (matches tests/checkout-queue/e2e/checkout-queue-e2e-test-page/flow-diagram.md):
//   UI -> Queue (one at a time) -> Atomic processing (Sanity CMS) -> Pop -> UI response
//
// Steps:
//   1. Validate BasketReservation shape (400 on mismatch).
//   2. RPUSH item onto Redis FIFO list.
//   3. Spin: SET NX lock + LINDEX head check; only head proceeds.
//   4. Create Sanity basketReservation doc with _id = requestId.
//   5. Transaction-inc reservedStock for each product.
//   6. Fetch updated products, build BasketReservationResponse.
//   7. LPOP + DEL lock. Return 202.

import { randomUUID } from 'node:crypto'
import { getQueueRedis } from './redis'
import { startHealthInterval } from './health'
import { trace } from './trace'
import { QUEUE_LIST_KEY, LOCK_KEY, LOCK_TTL_SEC } from './constants'

const RESERVATION_TTL_SEC = parseInt(process.env.RESERVATION_TTL_SEC || '900', 10)
import { getBackendClient } from '@/sanity/lib/backendClient'
import {
  isBasketReservation,
  type BasketReservation,
  type BasketReservationResponse,
  type RedisQueueItem,
} from './types'
import { getVerifiedPrice } from '@/lib/stripe'

export interface ProcessResult {
  status: 202 | 400 | 500
  body: BasketReservationResponse | { ok: false; error: string }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function processInline(raw: unknown): Promise<ProcessResult> {
  startHealthInterval()

  // 1. Validate
  if (!isBasketReservation(raw)) {
    return { status: 400, body: { ok: false, error: 'Invalid BasketReservation' } }
  }
  const request = raw as BasketReservation
  const requestId = randomUUID()
  const start = Date.now()

  await trace('request received', requestId, { itemCount: request.basketReservation.length })

  // 2. Enqueue
  const redis = getQueueRedis()
  const queueItem: RedisQueueItem = {
    id: requestId,
    enqueuedAt: Date.now(),
    payload: request,
  }
  const queueItemStr = JSON.stringify(queueItem)
  await redis.rpush(QUEUE_LIST_KEY, queueItemStr)
  await trace('queued', requestId)

  // 3. Spin lock + head check
  const deadline = start + 45_000
  while (true) {
    if (Date.now() > deadline) {
      await redis.lrem(QUEUE_LIST_KEY, 1, queueItemStr)
      await trace('timeout', requestId)
      return { status: 500, body: { ok: false, error: 'Queue wait timeout' } }
    }

    const got = await redis.set(LOCK_KEY, requestId, { nx: true, ex: LOCK_TTL_SEC })
    if (got !== 'OK') {
      await sleep(25)
      continue
    }

    const headRaw = await redis.lindex(QUEUE_LIST_KEY, 0)
    if (!headRaw) {
      await redis.del(LOCK_KEY)
      await sleep(25)
      continue
    }
    const head =
      typeof headRaw === 'string'
        ? (JSON.parse(headRaw) as RedisQueueItem)
        : (headRaw as RedisQueueItem)
    if (head.id !== requestId) {
      await redis.del(LOCK_KEY)
      await sleep(25)
      continue
    }
    break
  }

  await trace('processing', requestId)

  try {
    // 4. Verify prices and transform to CMS format
    const stripeVerificationData: Array<{ productId: string; stripePriceId: string; verifiedPrice: number }> = []
    const cmsBasketReservation = await Promise.all(
      request.basketReservation.map(async (p, i) => {
        const verifiedPrice = await getVerifiedPrice(p.stripePriceId)
        stripeVerificationData.push({
          productId: p._id,
          stripePriceId: p.stripePriceId,
          verifiedPrice,
        })
        return {
          _key: `${p._id}-${i}`,
          _id: p._id,
          quantity: p.quantity,
          verifiedPrice,
        }
      })
    )

    // 5. Create reservation doc
    const ttlSec = parseInt(process.env.RESERVATION_TTL_SEC || '900', 10)
    const expiresAt = new Date(Date.now() + ttlSec * 1000).toISOString()
    const sanity = getBackendClient()
    const doc = await sanity.create({
      _id: requestId,
      _type: 'basketReservation',
      basketReservation: cmsBasketReservation,
      createdAt: request.createdAt,
      expiresAt,
    })
    await trace('reservation document created', requestId, { docId: doc._id })

    // 6. Increment reservedStock atomically
    const tx = sanity.transaction()
    for (const item of request.basketReservation) {
      tx.patch(item._id, (p) => p.inc({ reservedStock: item.quantity }))
    }
    await tx.commit()
    await trace('reservedStock incremented', requestId)

    // 7. Fetch updated products
    const productIds = request.basketReservation.map((p) => p._id)
    const products = (await sanity.fetch(
      `*[_id in $ids]{ _id, stock, reservedStock, price_data }`,
      { ids: productIds }
    )) as Array<{ _id: string; stock: number; reservedStock: number; price_data: { currency: string; unit_amount: number } }>

    const response: BasketReservationResponse = {
      ok: true,
      reservationId: doc._id,
      ttl: RESERVATION_TTL_SEC,
      products: products.map((p) => ({
        id: p._id,
        realPrice: p.price_data.unit_amount / 100,
        reservedStock: p.reservedStock,
        stock: p.stock,
      })),
      debug: {
        stripeVerification: stripeVerificationData,
      },
    }

    // 7. Pop + release
    await redis.lpop(QUEUE_LIST_KEY)
    await redis.del(LOCK_KEY)
    await trace('complete', requestId, { durationMs: Date.now() - start })

    return { status: 202, body: response }
  } catch (err) {
    try {
      await redis.lpop(QUEUE_LIST_KEY)
    } catch {
      /* ignore */
    }
    await redis.del(LOCK_KEY)
    const message = err instanceof Error ? err.message : String(err)
    await trace('error', requestId, { error: message })
    return { status: 500, body: { ok: false, error: message } }
  }
}
