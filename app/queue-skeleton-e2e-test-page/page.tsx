'use client'

import { useState } from 'react'

const formatTime = (isoString: string | null) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('en-US', { hour12: false })
}

interface RequestState {
  id: number
  requestId: string | null
  status: 'pending' | 'success' | 'error'
  result: any
  requestBody: { publicBasket: { _id: string; quantity: number }[] }
  issuedAt: string | null
  responseAt: string | null
}

export default function QueueSkeletonE2ETestPage() {
  const [requests, setRequests] = useState<RequestState[]>([])
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    setRequests(
      Array.from({ length: 9 }, (_, i) => ({
        id: i + 1,
        requestId: null,
        status: 'pending' as const,
        result: null,
        requestBody: { publicBasket: [{ _id: `prod-${i + 1}`, quantity: i + 1 }] },
        issuedAt: new Date().toISOString(),
        responseAt: null
      }))
    )

    try {
      await Promise.all(
        Array.from({ length: 9 }, (_, i) =>
          fetch('/api/checkout-queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicBasket: [{ _id: `prod-${i + 1}`, quantity: i + 1 }] })
          }).then(async (res) => {
            const data = await res.json()
            setRequests((prev) =>
              prev.map((req) =>
                req.id === i + 1
                  ? {
                      ...req,
                      requestId: data.requestId,
                      status: data.ok ? 'success' : 'error',
                      result: data,
                      responseAt: new Date().toISOString()
                    }
                  : req
              )
            )
          })
        )
      )
    } catch (error) {
      console.error('Checkout error:', error)
      setRequests((prev) => prev.map((req) => ({ ...req, status: 'error' as const })))
    } finally {
      setLoading(false)
    }
  }

  const pendingRequests = requests.filter((req) => req.status === 'pending')
  const realizedRequests = requests.filter((req) => req.status !== 'pending')

  return (
    <div className="bg-white  text-black h-dvh">
      <div className="p-8 flex flex-col gap-4">
        <button data-testid="checkout-btn" onClick={handleClick} disabled={loading} className="btn-cart-large">
          {loading ? 'Processing...' : 'Checkout click'}
        </button>
        <p>
          {loading ? 'Processing 9 simultaneous basket reservation requests...' : 'Make 9 concurrent requests in 9 separate browser contexts'}
        </p>
        <p>Purpose: test if concurrent basket reservation requests to actual CMS are queued and processed one at a time (atomically), to verify the checkout queue skeleton works properly</p>
        <p>Why: queing basket reservation requests and one-at-a-time atomic processing prevents double-reservation, available stock mis-counting, CMS stock data corruption.</p>
        <p>Expected behavior: button click - 9 concurrent (simultaneous requests) for basket reservation {'->'} requests turn to 'success' one by one, instead of all at once.</p>

      </div>
      <div className="p-8">
        <div data-testid="pending-row" className="flex flex-col gap-2">
          {pendingRequests.map((req) => (
            <div key={req.id} className="bg-slate-300">
              Request {req.id}: pending - {JSON.stringify(req.requestBody)}
              <div className="text-xs text-gray-600">issued: {formatTime(req.issuedAt)}</div>
            </div>
          ))}
        </div>
        <div data-testid="realized-row" className="flex flex-col gap-2 mt-2">
          {realizedRequests.map((req) => (
            <div key={req.id} className="bg-green-300">
              Request {req.id}: {req.status} {req.requestId && `(${req.requestId})`} - {JSON.stringify(req.requestBody)}
              <div className="text-xs text-gray-600">issued: {formatTime(req.issuedAt)} | response: {formatTime(req.responseAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
