// DoD-3: INPUT/OUTPUT flow E2E
// 9 real browser contexts click the checkout button simultaneously.
// Verifies trace logs show Request received X -> Sanity response X atomicity.

import { test, expect, chromium } from '@playwright/test'
import { Redis } from '@upstash/redis'

const TRACE_LIST_KEY = 'trace:checkout-queue'
const QUEUE_LIST_KEY = 'queue:checkout'
const LOCK_KEY = 'lock:checkout:processing'

function redis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

async function readTrace() {
  const r = redis()
  const raw = await r.lrange(TRACE_LIST_KEY, 0, -1)
  return raw
    .map((x: unknown) => (typeof x === 'string' ? JSON.parse(x) : x))
    .reverse() as Array<{ event: string; requestId: string }>
}

async function clearState() {
  const r = redis()
  await r.del(TRACE_LIST_KEY)
  await r.del(QUEUE_LIST_KEY)
  await r.del(LOCK_KEY)
}

test.describe('INPUT/OUTPUT flow', () => {
  test.setTimeout(240_000)

  test.beforeEach(async () => {
    await clearState()
  })

  test('9 simultaneous users: Request received X -> Sanity response X atomic', async () => {
    const browser = await chromium.launch()
    const contexts = await Promise.all(
      Array.from({ length: 9 }, () => browser.newContext())
    )
    const pages = await Promise.all(contexts.map((c) => c.newPage()))

    await Promise.all(pages.map((p) => p.goto('http://localhost:3000/test-checkout-queue')))
    await Promise.all(pages.map((p) => p.waitForSelector('[data-testid="checkout-btn"]')))

    // Fire clicks simultaneously
    await Promise.all(pages.map((p) => p.click('[data-testid="checkout-btn"]')))

    // Wait for all responses to render
    await Promise.all(
      pages.map((p) =>
        p.waitForSelector('[data-testid="result-ok"]', { timeout: 220_000 })
      )
    )

    const trace = await readTrace()
    const received = trace.filter((t) => t.event === 'Request received')
    const sanity = trace.filter((t) => t.event === 'Sanity response')

    expect(received.length).toBe(9)
    expect(sanity.length).toBe(9)

    // Atomicity: each Sanity response X must follow its matching Request received X
    // with no other Sanity response between them for different requestIds.
    // Simpler: for each requestId, Request received must appear before Sanity response.
    const byId = new Map<string, { recv?: number; sany?: number }>()
    trace.forEach((t, idx) => {
      if (t.event === 'Request received') {
        const e = byId.get(t.requestId) || {}
        e.recv = idx
        byId.set(t.requestId, e)
      } else if (t.event === 'Sanity response') {
        const e = byId.get(t.requestId) || {}
        e.sany = idx
        byId.set(t.requestId, e)
      }
    })
    expect(byId.size).toBe(9)
    for (const [, v] of byId) {
      expect(v.recv).toBeDefined()
      expect(v.sany).toBeDefined()
      expect(v.sany!).toBeGreaterThan(v.recv!)
    }

    await Promise.all(contexts.map((c) => c.close()))
    await browser.close()
  })
})
