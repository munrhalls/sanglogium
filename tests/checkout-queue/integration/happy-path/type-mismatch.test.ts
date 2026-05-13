// Integration test: invalid BasketReservation payload → 400, no queue enqueue,
// no processing trace. Validates that the type guard blocks bad input upstream.

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { fetch } from 'undici'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

interface TraceEntry {
  event: string
  requestId: string
  ts: number
}

async function readTrace(): Promise<TraceEntry[]> {
  const res = await fetch(`${BASE}/api/checkout-queue/trace`)
  return (await res.json()) as TraceEntry[]
}

async function clearTrace() {
  await fetch(`${BASE}/api/checkout-queue/clear-trace`, { method: 'POST' })
}

describe('Checkout queue — type-mismatch rejection', () => {
  beforeAll(async () => {
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)
  })

  beforeEach(async () => {
    await clearTrace()
  })

  it('rejects payload missing price_data / createdAt with 400 and no processing trace', async () => {
    const invalid = {
      basketReservation: [{ _id: 'test-product-1', quantity: 1 }],
      // missing createdAt, missing price_data inside item
    }

    const response = await fetch(`${BASE}/api/checkout-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalid),
    })
    expect(response.status).toBe(400)

    // No processing entry should appear in the trace list for a rejected request.
    const trace = await readTrace()
    const processingEvents = trace.filter((t) => t.event === 'processing')
    expect(processingEvents.length).toBe(0)
  }, 30_000)
})
