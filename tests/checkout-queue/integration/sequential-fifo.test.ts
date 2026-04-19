// DoD-2: Sequential FIFO processing
// Hits the real Next.js dev server on :3000 with 9 concurrent POSTs.
// Asserts atomicity via the trace Redis list (pushed server-side by processInline).

import { describe, it, expect, beforeAll } from 'vitest'

// Use undici for Node.js fetch
import { fetch } from 'undici'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

interface TraceEntry {
  event: string
  requestId: string
  payload?: unknown
  ts: number
}

async function readTrace(): Promise<TraceEntry[]> {
  const res = await fetch(`${BASE}/api/checkout-queue/trace`)
  const entries = await res.json()
  return entries as TraceEntry[]
}

async function clearState() {
  await fetch(`${BASE}/api/checkout-queue/clear-trace`, { method: 'POST' })
}

describe('Sequential FIFO processing', () => {
  beforeAll(async () => {
    // Pre-flight: dev server reachable
    const res = await fetch(`${BASE}/api/checkout-queue`, { method: 'OPTIONS' }).catch(() => null)
    if (!res) throw new Error(`Dev server not running at ${BASE}. Run 'npm run dev' first.`)
  })

  beforeEach(async () => {
    await clearState()
  })

  it('processes 9 concurrent requests atomically (no interleaving)', async () => {
    const payloads = Array.from({ length: 9 }, (_, i) => ({
      publicBasket: [{ _id: `prod-${i + 1}`, quantity: i + 1 }]
    }))

    const responses = await Promise.all(
      payloads.map((p) =>
        fetch(`${BASE}/api/checkout-queue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        }).then((r) => r.json())
      )
    )

    expect(responses.length).toBe(9)
    responses.forEach((r: { ok: boolean }) => expect(r.ok).toBe(true))

    const trace = await readTrace()
    const launch = trace.filter((t) => t.event === 'launch first in queue to cms')
    const complete = trace.filter((t) => t.event === 'Request complete')

    expect(launch.length).toBe(9)
    expect(complete.length).toBe(9)

    // Atomicity: for every pair (launch X, Complete X) there must be no other
    // launch event between them.
    const procComp = trace.filter(
      (t) => t.event === 'launch first in queue to cms' || t.event === 'Request complete'
    )
    for (let i = 0; i < procComp.length; i += 2) {
      expect(procComp[i].event).toBe('launch first in queue to cms')
      expect(procComp[i + 1].event).toBe('Request complete')
      expect(procComp[i + 1].requestId).toBe(procComp[i].requestId)
    }
  }, 60_000)
})
