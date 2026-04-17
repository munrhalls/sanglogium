'use client'

// Minimal test-only page for DoD-3 E2E Playwright test.
// Renders a single button that POSTs to /api/checkout-queue.

import { useState } from 'react'

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; body: unknown }
  | { kind: 'err'; body: unknown; status: number }

export default function TestCheckoutQueuePage() {
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function click() {
    setState({ kind: 'loading' })
    try {
      const res = await fetch('/api/checkout-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n: 1 }),
      })
      const body = await res.json()
      if (res.ok) setState({ kind: 'ok', body })
      else setState({ kind: 'err', body, status: res.status })
    } catch (e) {
      setState({ kind: 'err', body: String(e), status: 0 })
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Checkout Queue Skeleton — Test Page</h1>
      <button data-testid="checkout-btn" onClick={click}>
        Checkout
      </button>
      <div style={{ marginTop: 16 }}>
        {state.kind === 'idle' && <span data-testid="result-idle">idle</span>}
        {state.kind === 'loading' && <span data-testid="result-loading">loading…</span>}
        {state.kind === 'ok' && (
          <pre data-testid="result-ok">{JSON.stringify(state.body, null, 2)}</pre>
        )}
        {state.kind === 'err' && (
          <pre data-testid="result-err">
            {String(state.status)} — {JSON.stringify(state.body, null, 2)}
          </pre>
        )}
      </div>
    </main>
  )
}
