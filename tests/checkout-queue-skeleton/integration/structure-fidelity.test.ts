// DoD-4: Type/structure fidelity
// Sends a valid request, asserts the 6 structure-existence trace entries appear in order.
// Sends a malformed request, asserts the handler returns 400 and at least the UI-request
// structure check logs valid:false.

import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { fetch } from 'undici'

const BASE = process.env.QUEUE_TEST_BASE_URL || 'http://localhost:3000'

async function readTrace() {
  const res = await fetch(`${BASE}/api/checkout-queue/trace`)
  const entries = await res.json()
  return entries as Array<{ event: string; payload?: { structure?: string; valid?: boolean } }>
}

async function clearState() {
  await fetch(`${BASE}/api/checkout-queue/clear-trace`, { method: 'POST' })
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
      body: JSON.stringify({ publicBasket: [{ _id: 'prod-1', quantity: 1 }] }),
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
