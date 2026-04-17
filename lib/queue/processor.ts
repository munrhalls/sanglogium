// Inline FIFO processor for the checkout queue skeleton.
// Sequential guarantee via:
//   1. RPUSH to a Redis list (preserves enqueue order in Redis single-threaded event loop)
//   2. Spin loop: SET NX lock, peek head with LINDEX, process only if head is me, LPOP, DEL lock
// One request at a time across all concurrent handlers.

import { randomUUID } from 'node:crypto'
import { getQueueRedis } from './redis'
import { startHealthInterval } from './health'
import { trace } from './trace'
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

  await trace('Request received', requestId, { type: 'UIRequest', n: uiReq.n })

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
  await redis.rpush(QUEUE_LIST_KEY, JSON.stringify(item))

  // 3. Spin: acquire lock + check head == me
  const deadline = start + 45_000
  let queuePosition = -1
  while (true) {
    if (Date.now() > deadline) {
      await redis.lrem(QUEUE_LIST_KEY, 1, JSON.stringify(item))
      return { status: 500, body: { ok: false, error: 'Queue wait timeout' } }
    }

    const got = await redis.set(LOCK_KEY, requestId, { nx: true, ex: LOCK_TTL_SEC })
    if (got !== 'OK') {
      await sleep(25)
      continue
    }

    // Lock held. Check if we're the head.
    const headRaw = await redis.lindex(QUEUE_LIST_KEY, 0)
    if (!headRaw) {
      await redis.del(LOCK_KEY)
      await sleep(25)
      continue
    }
    const head =
      typeof headRaw === 'string' ? (JSON.parse(headRaw) as RedisQueueItem) : (headRaw as RedisQueueItem)
    if (head.id !== requestId) {
      await redis.del(LOCK_KEY)
      await sleep(25)
      continue
    }

    // Measure queue position (for TRACE)
    queuePosition = 0
    break
  }

  try {
    await trace('Processing request', requestId, { queuePosition })

    // 4. CMSRequest structure check
    const cmsReq: CMSRequest = {
      requestId,
      query: '*[_type=="product"][0]{_id}',
    }
    await logStructure(requestId, 'CMSRequest', cmsReq)

    // 5. Sanity read-only probe
    let productId: string | null = null
    let sanitySuccess = false
    try {
      const r = (await backendClient.fetch(cmsReq.query)) as { _id?: string } | null
      productId = r?._id ?? null
      sanitySuccess = true
    } catch (err) {
      console.error('TRACE: Sanity probe failed', { requestId, err })
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
      n: uiReq.n,
      productId,
      durationMs: Date.now() - start,
    }
    await logStructure(requestId, 'UIResponse', uiResp)

    // 9. Pop head + release lock
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
