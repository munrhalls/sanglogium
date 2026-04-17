// DoD-4: Type/structure fidelity
// Sends a valid request, asserts the 6 structure-existence trace entries appear in order.
// Sends a malformed request, asserts the handler returns 400 and at least the UI-request
// structure check logs valid:false.

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { getQueueRedis } from '@/lib/queue/redis'
import { TRACE_LIST_KEY, QUEUE_LIST_KEY } from '@/lib/queue/constants'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

async function readTrace() {
  const redis = getQueueRedis()
  const raw = await redis.lrange(TRACE_LIST_KEY, 0, -1)
  return raw
    .map((r) => (typeof r === 'string' ? JSON.parse(r) : r))
    .reverse() as Array<{ event: string; payload?: { structure?: string; valid?: boolean } }>
}

async function clearState() {
  const redis = getQueueRedis()
  await redis.del(TRACE_LIST_KEY)
  await redis.del(QUEUE_LIST_KEY)
  await redis.del('lock:checkout:processing')
}

describe('Type/structure fidelity', () => {
  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)
  })

  beforeEach(async () => {
    await clearState()
  })

  it('emits 6 structure-existence trace entries in order for a valid request', async () => {
    const r = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n: 42 }),
    })
    expect(r.ok).toBe(true)

    const trace = await readTrace()
    const structures = trace
      .filter((t) => t.event === 'structure exists')
      .map((t) => t.payload?.structure)

    expect(structures).toEqual([
      'UIRequest',
      'RedisQueue',
      'CMSRequest',
      'CMSResponse',
      'RedisQueue',
      'UIResponse',
    ])
  }, 30_000)

  it('rejects a malformed request with 400 and logs invalid UIRequest', async () => {
    const r = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wrong: 'shape' }),
    })
    expect(r.status).toBe(400)

    const trace = await readTrace()
    const uiReq = trace.find(
      (t) => t.event === 'structure exists' && t.payload?.structure === 'UIRequest'
    )
    expect(uiReq).toBeDefined()
    expect(uiReq?.payload?.valid).toBe(false)
  }, 30_000)
})
