import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCheckoutSession } from '@/lib/session'
import { retrievePaymentIntent } from '@/lib/stripe'
import OrderDetails from './OrderDetails'
import { RefreshButton } from './RefreshButton'

interface SuccessPageSearchParams {
  payment_intent?: string
  status?: 'failed' | 'canceled' | 'processing'
  error?: 'verification_failed'
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<SuccessPageSearchParams>
}) {
  const { payment_intent, error } = await searchParams

  // Privacy guard — FIRST, before any Stripe call
  if (!payment_intent) {
    redirect('/basket')
  }

  const session = await getCheckoutSession()
  if (session.completedPaymentIntentId !== payment_intent) {
    redirect('/basket')
  }

  // Verification-failed path set by Route Handler catch
  if (error === 'verification_failed') {
    return (
      <section role="alert" className="rounded border border-red-200 bg-red-50 p-6">
        <h1 className="mb-2 text-xl font-bold">We couldn&apos;t verify your payment status right now</h1>
        <p className="mb-4 text-gray-700">
          Your card may have been charged. Please contact support with this reference:
        </p>
        <code className="mb-4 block rounded bg-gray-100 px-3 py-2 font-mono text-sm">{payment_intent}</code>
        <div className="flex gap-4">
          <a href="/basket" className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
            Return to basket
          </a>
          <a href="/support" className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Contact support
          </a>
        </div>
      </section>
    )
  }

  // Verify PI status server-side (try/catch — never throw on catch, user already paid)
  let pi: Awaited<ReturnType<typeof retrievePaymentIntent>> | null = null
  try {
    pi = await retrievePaymentIntent(payment_intent)
  } catch {
    // Stripe API down — render recoverable error, same as verification_failed branch
    return (
      <section role="alert" className="rounded border border-red-200 bg-red-50 p-6">
        <h1 className="mb-2 text-xl font-bold">We couldn&apos;t verify your payment status right now</h1>
        <p className="mb-4 text-gray-700">
          Your card may have been charged. Please contact support with this reference:
        </p>
        <code className="mb-4 block rounded bg-gray-100 px-3 py-2 font-mono text-sm">{payment_intent}</code>
        <div className="flex gap-4">
          <a href="/basket" className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
            Return to basket
          </a>
          <a href="/support" className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Contact support
          </a>
        </div>
      </section>
    )
  }

  // Succeeded branch
  if (pi.status === 'succeeded') {
    const amountPLN = (pi.amount / 100).toLocaleString('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    })

    const paymentMethodHint =
      pi.payment_method_types?.includes('blik')
        ? 'BLIK'
        : pi.latest_charge
          ? 'card'
          : null

    return (
      <div>
        <div className="mb-6 rounded bg-green-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-green-800">Payment confirmed</h1>
          </div>
          <p className="text-lg text-green-700">{amountPLN}</p>
          {paymentMethodHint && (
            <p className="mt-1 text-sm text-green-600">via {paymentMethodHint}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secured by Stripe</span>
          </div>
        </div>
        <Suspense
          fallback={<p className="text-gray-500">Fetching order details…</p>}
        >
          <OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} />
        </Suspense>
        <div className="mt-6 rounded border border-gray-200 p-4 text-sm text-gray-600">
          <h3 className="mb-1 font-semibold text-gray-800">Need help?</h3>
          <p className="mb-2">If you have any questions about your order, contact our support team.</p>
          <a
            href="mailto:support@sanglogium.com?subject=Order%20Support%20Request"
            className="inline-block rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            Email support
          </a>
        </div>
      </div>
    )
  }

  // Failed branch
  if (pi.status === 'requires_payment_method') {
    const declineMessage =
      (pi as { last_payment_error?: { message?: string } }).last_payment_error?.message ??
      'Payment was declined.'
    return (
      <section role="alert" className="rounded border border-red-200 bg-red-50 p-6">
        <h1 className="mb-2 text-xl font-bold">Payment was declined</h1>
        <p className="mb-4 text-gray-700">{declineMessage}</p>
        <div className="flex gap-4">
          <a
            href="/checkout/payment"
            className="inline-block rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Try again
          </a>
          <a
            href="/basket"
            className="inline-block rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Return to basket
          </a>
        </div>
      </section>
    )
  }

  // Canceled branch
  if (pi.status === 'canceled') {
    return (
      <section role="alert" className="rounded border border-yellow-200 bg-yellow-50 p-6">
        <h1 className="mb-2 text-xl font-bold">Payment was canceled</h1>
        <div className="flex gap-4">
          <a
            href="/checkout/payment"
            className="inline-block rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Try again
          </a>
          <a
            href="/basket"
            className="inline-block rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Return to basket
          </a>
        </div>
      </section>
    )
  }

  // Processing branch
  if (pi.status === 'processing') {
    return (
      <section role="alert" className="rounded border border-blue-200 bg-blue-50 p-6">
        <h1 className="mb-2 text-xl font-bold">Payment is processing</h1>
        <p className="mb-2 text-gray-700">
          Your payment is being processed by your bank. This usually takes a few minutes.
        </p>
        <p className="mb-4 text-gray-600">
          We&apos;ll email a confirmation when settled.
        </p>
        <RefreshButton />
        <div className="mt-4 text-xs text-gray-500">
          <p>Stuck? Contact support with reference: <code className="rounded bg-gray-100 px-1 py-0.5 font-mono">{payment_intent}</code></p>
        </div>
      </section>
    )
  }

  // Unexpected status — shouldn't reach here (Route Handler handles it), but safety net
  return (
    <section role="alert" className="rounded border border-gray-200 p-6">
      <h1 className="mb-2 text-xl font-bold">Unexpected payment status</h1>
      <p className="mb-4 text-gray-700">
        Please contact support with this reference:
      </p>
      <code className="mb-4 block rounded bg-gray-100 px-3 py-2 font-mono text-sm">{payment_intent}</code>
      <a href="/basket" className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700">
        Return to basket
      </a>
    </section>
  )
}
