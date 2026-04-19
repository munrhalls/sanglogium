// Inline FIFO processor for the checkout queue skeleton.
// Sequential guarantee via:
//   1. RPUSH to a Redis list (preserves enqueue order in Redis single-threaded event loop)
//   2. Spin loop: SET NX lock, peek head with LINDEX, process only if head is me, LPOP, DEL lock
// One request at a time across all concurrent handlers.

import { randomUUID } from 'node:crypto'
import { getQueueRedis } from './redis'
import { startHealthInterval } from './health'
import { trace, traceSanity } from './trace'
import {
  QUEUE_LIST_KEY,
  LOCK_KEY,
  LOCK_TTL_SEC,
} from './constants'
import {
  isUIRequest,
  isRedisQueueItem,
  isCMSRequest,
  isCMSResponse,
  isUIResponse,
  type UIRequest,
  type UIResponse,
  type RedisQueueItem,
  type CMSRequest,
  type CMSResponse,
} from './types'
import { backendClient } from '@/sanity/lib/backendClient'

async function logStructure(
  requestId: string,
  structure: 'UIRequest' | 'RedisQueue' | 'CMSRequest' | 'CMSResponse' | 'UIResponse',
  value: unknown
): Promise<boolean> {
  let valid = false
  switch (structure) {
    case 'UIRequest':
      valid = isUIRequest(value)
      break
    case 'RedisQueue':
      valid = isRedisQueueItem(value)
      break
    case 'CMSRequest':
      valid = isCMSRequest(value)
      break
    case 'CMSResponse':
      valid = isCMSResponse(value)
      break
    case 'UIResponse':
      valid = isUIResponse(value)
      break
  }
  await trace('structure exists', requestId, { structure, valid })
  return valid
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export interface ProcessResult {
  status: 200 | 400 | 500
  body: UIResponse | { ok: false; error: string }
}

/**
 * Enqueue, wait for turn, process Sanity probe, return UI response.
 * Atomic one-at-a-time across all concurrent callers.
 */
export async function processInline(raw: unknown): Promise<ProcessResult> {
  console.log('TRACE Bus Stop 5: processInline called', { timestamp: Date.now(), raw })
  startHealthInterval()

  const requestId = randomUUID()
  const start = Date.now()

  await trace('Type validation', requestId, {
    requestType: 'UIRequest',
    responseType: 'UIResponse',
  })

  // 1. UIRequest structure check
  const uiValid = await logStructure(requestId, 'UIRequest', raw)
  if (!uiValid) {
    return { status: 400, body: { ok: false, error: 'Invalid UIRequest' } }
  }
  const uiReq = raw as UIRequest

  await trace('get new request', requestId, { type: 'UIRequest', itemCount: uiReq.publicBasket.length })

  // 2. Enqueue + RedisQueue structure check
  const item: RedisQueueItem = {
    id: requestId,
    enqueuedAt: Date.now(),
    payload: uiReq,
  }
  const redisValidIn = await logStructure(requestId, 'RedisQueue', item)
  if (!redisValidIn) {
    return { status: 500, body: { ok: false, error: 'Invalid Redis queue item' } }
  }

  const redis = getQueueRedis()
  await trace('queue it', requestId, { queuePosition: -1 })
  console.log('TRACE Bus Stop 6: Enqueuing to Redis', { requestId, timestamp: Date.now() })
  await redis.rpush(QUEUE_LIST_KEY, JSON.stringify(item))

  // 3. Spin: acquire lock + check head == me
  const deadline = start + 45_000
  let queuePosition = -1
  let lockAttempts = 0
  while (true) {
    if (Date.now() > deadline) {
      await redis.lrem(QUEUE_LIST_KEY, 1, JSON.stringify(item))
      return { status: 500, body: { ok: false, error: 'Queue wait timeout' } }
    }

    const got = await redis.set(LOCK_KEY, requestId, { nx: true, ex: LOCK_TTL_SEC })
    lockAttempts++
    if (got !== 'OK') {
      if (lockAttempts % 20 === 0) {
        console.log('TRACE Bus Stop 7: Lock acquisition retrying', { requestId, attempts: lockAttempts, timestamp: Date.now() })
      }
      await sleep(25)
      continue
    }
    console.log('TRACE Bus Stop 7: Lock acquired', { requestId, attempts: lockAttempts, timestamp: Date.now() })

    // Lock held. Check if we're the head.
    const headRaw = await redis.lindex(QUEUE_LIST_KEY, 0)
    console.log('TRACE Bus Stop 8: Head verification', { requestId, hasHead: !!headRaw, timestamp: Date.now() })
    if (!headRaw) {
      await redis.del(LOCK_KEY)
      await sleep(25)
      continue
    }
    const head =
      typeof headRaw === 'string' ? (JSON.parse(headRaw) as RedisQueueItem) : (headRaw as RedisQueueItem)
    if (head.id !== requestId) {
      console.log('TRACE Bus Stop 8: Not at head, releasing lock', { requestId, headId: head.id, timestamp: Date.now() })
      await redis.del(LOCK_KEY)
      await sleep(25)
      continue
    }

    // Measure queue position (for TRACE)
    queuePosition = 0
    console.log('TRACE Bus Stop 8: At head, proceeding to process', { requestId, timestamp: Date.now() })
    break
  }

  try {
    await trace('launch first in queue to cms', requestId, { queuePosition })

    // 4. CMSRequest structure check
    const cmsReq: CMSRequest = {
      requestId,
      query: '*[_type=="product"][0]{_id, stock, reservedStock}',
    }
    await logStructure(requestId, 'CMSRequest', cmsReq)

    // 5. Sanity read-only probe
    await trace('wait for response', requestId, { waiting: true })
    let productId: string | null = null
    let stock: number | null = null
    let reservedStock: number | null = null
    let sanitySuccess = false

    try {
      await traceSanity('before sanity request', requestId, { query: cmsReq.query })
      console.log('TRACE Bus Stop 9: Executing Sanity probe', { requestId, query: cmsReq.query, timestamp: Date.now() })
      const r = (await backendClient.fetch(cmsReq.query)) as { _id?: string; stock?: number; reservedStock?: number } | null
      productId = r?._id ?? null
      stock = r?.stock ?? null
      reservedStock = r?.reservedStock ?? null
      sanitySuccess = true
      console.log('TRACE Bus Stop 9: Sanity probe completed', { requestId, productId, stock, reservedStock, timestamp: Date.now() })
      await traceSanity('after sanity response', requestId, { productId, stock, reservedStock, response: r })
    } catch (err) {
      console.error('TRACE Bus Stop 9: Sanity probe failed', { requestId, err, timestamp: Date.now() })
      sanitySuccess = false
    }

    // 6. CMSResponse structure check
    const cmsResp: CMSResponse = { requestId, productId, success: sanitySuccess }
    await logStructure(requestId, 'CMSResponse', cmsResp)

    await trace('Sanity response', requestId, { success: sanitySuccess })

    // 7. RedisQueue structure check (outbound)
    await logStructure(requestId, 'RedisQueue', item)

    // 8. Build UIResponse + structure check
    const uiResp: UIResponse = {
      ok: sanitySuccess,
      requestId,
      basketItemCount: uiReq.publicBasket.length,
      productId,
      durationMs: Date.now() - start,
    }
    console.log('TRACE Bus Stop 10: UIResponse built', { requestId, ok: sanitySuccess, durationMs: uiResp.durationMs, timestamp: Date.now() })
    await logStructure(requestId, 'UIResponse', uiResp)

    await trace('return response to ui', requestId, { ok: sanitySuccess, duration: uiResp.durationMs })

    // 9. Pop head + release lock
    await trace('pop 1st in queue (atomic)', requestId, { popping: true })
    console.log('TRACE Bus Stop 11: Popping from queue and releasing lock', { requestId, timestamp: Date.now() })
    await redis.lpop(QUEUE_LIST_KEY)
    await redis.del(LOCK_KEY)

    await trace('Request complete', requestId, { duration: uiResp.durationMs })

    return { status: 200, body: uiResp }
  } catch (err) {
    // Best-effort cleanup
    try {
      await redis.lpop(QUEUE_LIST_KEY)
    } catch {
      /* ignore */
    }
    await redis.del(LOCK_KEY)
    await trace('Request complete', requestId, {
      duration: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    })
    return { status: 500, body: { ok: false, error: 'processing error' } }
  }
}
