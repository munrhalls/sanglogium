'use client'
// Client component: Interactive test UI for checkout queue concurrency testing
// Receives test products as props from server component

import { useState, useEffect } from 'react'

const CONCURRENT_REQUESTS = 9

interface BasketReservationResponse {
  ok: true
  reservationId: string
  products: Array<{ id: string; realPrice: number; reservedStock: number; stock: number }>
}

interface ErrorResponse {
  ok: false
  error: string
}

type ApiResponse = BasketReservationResponse | ErrorResponse

interface RequestState {
  id: number
  reservationId: string | null
  status: 'pending' | 'success' | 'error'
  result: ApiResponse | null
  requestBody: {
    basketReservation: Array<{ _id: string; quantity: number; stripePriceId: string; price_data: { currency: string; unit_amount: number } }>
    createdAt: string
  }
  issuedAt: string
  responseAt: string | null
}

interface TraceEntry {
  event: string
  requestId: string
  ts: number
  payload?: Record<string, unknown>
}

interface TestProduct {
  _id: string
  stripePriceId: string
  price_data: { currency: string; unit_amount: number }
}

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour12: false }) : ''

interface ProcessingWindow {
  requestId: string
  requestNum: number
  processingStart: number
  completeEnd: number
}

const analyzeProcessingOverlap = (traceGroups: Record<string, TraceEntry[]>) => {
  const windows: ProcessingWindow[] = []

  Object.entries(traceGroups).forEach(([rid, entries]) => {
    const processing = entries.find((e) => e.event === 'processing')
    const complete = entries.find((e) => e.event === 'complete')
    if (processing && complete) {
      windows.push({
        requestId: rid,
        requestNum: windows.length + 1,
        processingStart: processing.ts,
        completeEnd: complete.ts,
      })
    }
  })

  windows.sort((a, b) => a.processingStart - b.processingStart)

  const analysis = windows.map((window, idx) => {
    const startTime = new Date(window.processingStart).toLocaleTimeString('en-US', {
      hour12: false,
    })
    const endTime = new Date(window.completeEnd).toLocaleTimeString('en-US', {
      hour12: false,
    })

    let status = ''
    if (idx === 0) {
      status = '(first request)'
    } else {
      const prev = windows[idx - 1]
      if (window.processingStart >= prev.completeEnd) {
        status = `✓ sequential (starts after Request ${prev.requestNum} completes)`
      } else {
        status = `⚠ OVERLAP with Request ${prev.requestNum}`
      }
    }

    return `Request ${window.requestNum}: ${startTime}-${endTime} (processing window) ${status}`
  })

  const hasParallel = windows.some((w, idx) => {
    if (idx === 0) return false
    return w.processingStart < windows[idx - 1].completeEnd
  })

  return {
    analysis,
    hasParallel,
    summary: hasParallel
      ? 'PARALLEL PROCESSING DETECTED - requests are overlapping'
      : 'SEQUENTIAL PROCESSING CONFIRMED - requests are processed one at a time',
  }
}

interface CheckoutQueueTestClientProps {
  testProducts: TestProduct[]
}

export default function CheckoutQueueTestClient({ testProducts }: CheckoutQueueTestClientProps) {
  const [requests, setRequests] = useState<RequestState[]>([])
  const [loading, setLoading] = useState(false)
  const [traceEntries, setTraceEntries] = useState<TraceEntry[]>([])
  const [polling, setPolling] = useState(false)
  const [cmsReservations, setCmsReservations] = useState<Record<string, unknown>>({})
  const [fetchingCms, setFetchingCms] = useState(false)
  const [cleanupScheduled, setCleanupScheduled] = useState(false)
  const [totalReservationCount, setTotalReservationCount] = useState<number>(0)
  const [fetchingCount, setFetchingCount] = useState(false)

  const fetchTraces = async () => {
    try {
      const res = await fetch('/api/checkout-queue/trace')
      const data = (await res.json()) as TraceEntry[]
      setTraceEntries(data)
    } catch (err) {
      console.error('TRACE fetch error', err)
    }
  }

  const fetchCmsReservations = async () => {
    setFetchingCms(true)
    const results: Record<string, unknown> = {}

    for (const req of requests) {
      if (!req.reservationId) continue

      try {
        const res = await fetch(`/api/basket-reservations/${req.reservationId}`)
        const data = await res.json()
        results[req.reservationId] = data
      } catch (err) {
        console.error(`Failed to fetch reservation ${req.reservationId}:`, err)
        results[req.reservationId] = { error: 'Failed to fetch' }
      }
    }

    setCmsReservations(results)
    setFetchingCms(false)
  }

  const cleanupAllReservations = async () => {
    try {
      const res = await fetch('/api/basket-reservations', { method: 'DELETE' })
      const data = await res.json()
      console.log('Cleanup completed:', data)
      await fetchTotalReservationCount()
    } catch (err) {
      console.error('Cleanup failed:', err)
    }
  }

  const fetchTotalReservationCount = async () => {
    setFetchingCount(true)
    try {
      const res = await fetch('/api/basket-reservations')
      const data = await res.json()
      setTotalReservationCount(data.count || 0)
    } catch (err) {
      console.error('Failed to fetch reservation count:', err)
    } finally {
      setFetchingCount(false)
    }
  }

  useEffect(() => {
    if (!polling) return
    fetchTraces()
    const interval = setInterval(fetchTraces, 1000)
    return () => clearInterval(interval)
  }, [polling])

  const handleClick = async () => {
    setLoading(true)
    setPolling(true)

    // Schedule cleanup 10 minutes after checkout (runs once)
    if (!cleanupScheduled) {
      setCleanupScheduled(true)
      setTimeout(() => {
        cleanupAllReservations()
      }, 10 * 60 * 1000) // 10 minutes
    }

    // Clear server-side traces/queue so this run is visually isolated.
    await fetch('/api/checkout-queue/clear-trace', { method: 'POST' }).catch(() => null)

    const now = new Date().toISOString()
    const initial: RequestState[] = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => {
      const product = testProducts[i % testProducts.length]
      return {
        id: i + 1,
        reservationId: null,
        status: 'pending',
        result: null,
        requestBody: {
          basketReservation: [{ _id: product._id, quantity: 1, stripePriceId: product.stripePriceId, price_data: product.price_data }],
          createdAt: now,
        },
        issuedAt: now,
        responseAt: null,
      }
    })
    setRequests(initial)

    try {
      await Promise.all(
        initial.map((req) =>
          fetch('/api/checkout-queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.requestBody),
          })
            .then(async (res) => {
              const data = (await res.json()) as ApiResponse
              setRequests((prev) =>
                prev.map((r) =>
                  r.id === req.id
                    ? {
                        ...r,
                        reservationId: data.ok ? data.reservationId : null,
                        status: data.ok ? 'success' : 'error',
                        result: data,
                        responseAt: new Date().toISOString(),
                      }
                    : r
                )
              )
            })
            .catch((err) => {
              console.error('request error', err)
              setRequests((prev) =>
                prev.map((r) =>
                  r.id === req.id
                    ? { ...r, status: 'error', responseAt: new Date().toISOString() }
                    : r
                )
              )
            })
        )
      )
    } finally {
      setLoading(false)
      // Keep polling briefly so trailing trace entries land.
      setTimeout(() => setPolling(false), 2000)
    }
  }

  const pending = requests.filter((r) => r.status === 'pending')
  const realized = requests.filter((r) => r.status !== 'pending')

  // Group trace entries by reservationId, filter to only the current run's IDs.
  const currentIds = new Set(requests.map((r) => r.reservationId).filter(Boolean) as string[])
  const traceGroups = traceEntries.reduce<Record<string, TraceEntry[]>>((acc, entry) => {
    if (!currentIds.has(entry.requestId)) return acc
    if (!acc[entry.requestId]) acc[entry.requestId] = []
    acc[entry.requestId].push(entry)
    return acc
  }, {})

  // Analyze processing overlap
  const overlapAnalysis = analyzeProcessingOverlap(traceGroups)

  return (
    <div className="bg-white text-black min-h-dvh overflow-y-auto">
      <script
        dangerouslySetInnerHTML={{ __html: `mermaid.initialize({ startOnLoad: true });` }}
      />
      <div className="flex justify-center items-center">
        <div className="mermaid">{`flowchart LR
          UI[UI] --> Queue[Queue<br/>one at a time]
          Queue --> Atomic[Atomic<br/>processing]
          Atomic --> CMS[Sanity CMS]
          CMS --> Pop[Queue<br/>pop]
          Pop --> Response[UI response]`}</div>
      </div>

      <div className="p-8 flex flex-col gap-4">
        <button
          data-testid="checkout-btn"
          onClick={handleClick}
          disabled={loading}
          className="btn-cart-large"
        >
          {loading ? 'Processing...' : 'Checkout click'}
        </button>
        <p>
          Purpose: fires {CONCURRENT_REQUESTS} concurrent basket-reservation requests and verifies
          they are processed <strong>one at a time</strong> (atomic FIFO) by the checkout queue.
        </p>
        <p>
          Why: serializing reservation writes prevents double-reservation, stock mis-counting and
          Sanity `reservedStock` corruption under concurrent checkout clicks.
        </p>
        <p>
          Expected: pending requests turn &quot;success&quot; one by one (not all at once), and
          each request&apos;s trace timeline shows <em>queued → processing → reservation document
          created → reservedStock incremented → complete</em> without interleaving another
          request&apos;s <em>processing</em> event in between.
        </p>
      </div>

      <div className="p-8">
        <div data-testid="pending-row" className="flex flex-col gap-2">
          {pending.map((r) => (
            <div key={r.id} className="bg-slate-300 p-2">
              <div>
                Request {r.id}: pending — {JSON.stringify(r.requestBody)}
              </div>
              <div className="text-xs text-gray-600">issued: {formatTime(r.issuedAt)}</div>
            </div>
          ))}
        </div>
        <div data-testid="realized-row" className="flex flex-col gap-2 mt-2">
          {realized.map((r) => (
            <div
              key={r.id}
              className={r.status === 'success' ? 'bg-green-300 p-2' : 'bg-red-300 p-2'}
            >
              <div>
                Request {r.id}: {r.status}
                {r.reservationId && <span className="text-xs"> ({r.reservationId})</span>}
              </div>
              <div className="text-xs text-gray-600">
                issued: {formatTime(r.issuedAt)} | response: {formatTime(r.responseAt)}
              </div>
              {r.result && r.result.ok && (
                <div className="text-xs mt-1">
                  products:{' '}
                  {r.result.products
                    .map((p) => `${p.id} stock=${p.stock} reserved=${p.reservedStock}`)
                    .join(' | ')}
                </div>
              )}
              {r.result && !r.result.ok && (
                <div className="text-xs mt-1 text-red-900">error: {r.result.error}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold">Trace timeline ({Object.keys(traceGroups).length} requests)</h3>
          <button onClick={fetchTraces} className="text-xs border px-2 py-1">
            Refresh
          </button>
        </div>
        {Object.keys(traceGroups).length === 0 ? (
          <div className="text-sm text-gray-500">
            No trace entries yet. Click checkout to generate traces.
          </div>
        ) : (
          Object.entries(traceGroups).map(([rid, entries]) => (
            <div key={rid} className="mb-4 border p-2">
              <div className="font-semibold text-sm">{rid}</div>
              {entries.map((e, idx) => (
                <div key={idx} className="text-xs ml-2">
                  {new Date(e.ts).toLocaleTimeString('en-US', { hour12: false })}: {e.event}
                  {e.payload && (
                    <span className="text-gray-600"> {JSON.stringify(e.payload)}</span>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {Object.keys(traceGroups).length > 0 && (
        <div className="p-8 border-t">
          <h3 className="font-bold mb-2">Overlap Analysis</h3>
          <div
            className={`text-sm mb-2 font-semibold ${
              overlapAnalysis.hasParallel ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {overlapAnalysis.summary}
          </div>
          <div className="bg-slate-100 p-4 font-mono text-xs whitespace-pre-wrap">
            {overlapAnalysis.analysis.join('\n')}
          </div>
        </div>
      )}

      {realized.length > 0 && (
        <div className="p-8 border-t">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold">CMS Basket Reservations</h3>
            <button
              onClick={fetchCmsReservations}
              disabled={fetchingCms}
              className="text-xs border px-2 py-1"
            >
              {fetchingCms ? 'Fetching...' : 'Check basket reservations in CMS'}
            </button>
          </div>
          {Object.keys(cmsReservations).length === 0 ? (
            <div className="text-sm text-gray-500">
              Click button to verify reservations exist in Sanity CMS.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {realized.map((r) => {
                if (!r.reservationId) return null
                const cmsData = cmsReservations[r.reservationId]
                const hasError = cmsData && typeof cmsData === 'object' && 'error' in cmsData
                return (
                  <div key={r.id} className="border p-2">
                    <div className="font-semibold text-sm">
                      Request {r.id}: {r.reservationId}
                    </div>
                    <div className="text-xs mt-1">
                      {hasError ? (
                        <span className="text-red-600">
                          Error: {(cmsData as { error: string }).error}
                        </span>
                      ) : cmsData ? (
                        <span className="text-green-600">✓ Found in CMS</span>
                      ) : (
                        <span className="text-gray-500">Not fetched yet</span>
                      )}
                    </div>
                    {cmsData && !hasError && (
                      <div className="text-xs mt-1 bg-slate-100 p-2 whitespace-pre-wrap">
                        {JSON.stringify(cmsData, null, 2)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="p-8 border-t">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-bold">All Reservations in CMS</h3>
          <button
            onClick={fetchTotalReservationCount}
            disabled={fetchingCount}
            className="text-xs border px-2 py-1"
          >
            {fetchingCount ? 'Fetching...' : 'Refresh count'}
          </button>
          <button
            onClick={cleanupAllReservations}
            className="text-xs border px-2 py-1 bg-red-100 hover:bg-red-200"
          >
            Delete all reservations
          </button>
        </div>
        <div className="text-sm">
          Total basket reservations in CMS: <span className="font-bold">{totalReservationCount}</span>
        </div>
        {cleanupScheduled && (
          <div className="text-xs text-gray-500 mt-1">
            Auto-cleanup scheduled in 10 minutes after checkout
          </div>
        )}
      </div>
    </div>
  )
}
