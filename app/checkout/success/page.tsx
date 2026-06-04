import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle, Lock, WarningCircle, XCircle, Clock } from '@phosphor-icons/react/dist/ssr'
import { getCheckoutSession } from '@/lib/session'
import { retrievePaymentIntent } from '@/lib/stripe'
import OrderDetails from './OrderDetails'
import { RefreshButton } from './RefreshButton'

interface SuccessPageSearchParams {
  payment_intent?: string
  status?: 'failed' | 'canceled' | 'processing'
  error?: 'verification_failed'
}

function OrderDetailsSkeleton() {
  return (
    <div className="card-base animate-pulse">
      <div className="space-y-3">
        <div className="h-4 w-36 rounded-sm bg-secondary-800/60" />
        <div className="h-3 w-28 rounded-sm bg-secondary-800/60" />
        <div className="h-px w-full bg-secondary-700 my-4" />
        <div className="h-4 w-full rounded-sm bg-secondary-800/60" />
        <div className="h-4 w-4/5 rounded-sm bg-secondary-800/60" />
        <div className="h-px w-full bg-secondary-700 my-4" />
        <div className="h-4 w-full rounded-sm bg-secondary-800/60" />
        <div className="h-4 w-full rounded-sm bg-secondary-800/60" />
        <div className="h-px w-full bg-secondary-700 my-2" />
        <div className="h-5 w-full rounded-sm bg-secondary-800/60" />
      </div>
    </div>
  )
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
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <WarningCircle size={24} className="text-error-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">We couldn&apos;t verify your payment status</h1>
            </div>
            <p className="type-body text-text-caption">
              Your card may have been charged. Contact support with this reference:
            </p>
            <code className="block font-mono type-caption text-brand-400 bg-surface-elevated rounded-md px-3 py-2">
              {payment_intent}
            </code>
            <div className="flex flex-wrap gap-3">
              <a href="/basket" className="btn-primary px-6 py-2.5">Return to basket</a>
              <a href="/support" className="btn-secondary px-6 py-2.5">Contact support</a>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Verify PI status server-side (try/catch — never throw on catch, user already paid)
  let pi: Awaited<ReturnType<typeof retrievePaymentIntent>> | null = null
  try {
    pi = await retrievePaymentIntent(payment_intent)
  } catch {
    // Stripe API down — render recoverable error, same as verification_failed branch
    return (
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <WarningCircle size={24} className="text-error-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">We couldn&apos;t verify your payment status</h1>
            </div>
            <p className="type-body text-text-caption">
              Your card may have been charged. Contact support with this reference:
            </p>
            <code className="block font-mono type-caption text-brand-400 bg-surface-elevated rounded-md px-3 py-2">
              {payment_intent}
            </code>
            <div className="flex flex-wrap gap-3">
              <a href="/basket" className="btn-primary px-6 py-2.5">Return to basket</a>
              <a href="/support" className="btn-secondary px-6 py-2.5">Contact support</a>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Succeeded branch
  if (pi.status === 'succeeded') {
    const amountPLN = (pi.amount / 100).toLocaleString('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    })

    const paymentMethodHint = (() => {
      const types = pi.payment_method_types ?? []
      const type = types[0]
      const charge =
        typeof pi.latest_charge === 'object' && pi.latest_charge !== null
          ? pi.latest_charge
          : null
      const card = charge?.payment_method_details?.card

      switch (type) {
        case 'blik':
          return 'BLIK'
        case 'p24':
          return 'Przelewy24'
        case 'paypal':
          return 'PayPal'
        case 'klarna':
          return 'Klarna'
        case 'link':
          return 'Link'
        case 'card': {
          const wallet = card?.wallet?.type
          if (wallet === 'apple_pay') return 'Apple Pay'
          if (wallet === 'google_pay') return 'Google Pay'
          if (card?.brand && card?.last4) {
            const brand = card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
            return `${brand} ····${card.last4}`
          }
          return 'Card'
        }
        default:
          return type ?? null
      }
    })()

    return (
      <section aria-label="Order confirmation" className="flex flex-col gap-6">
        <div className="card-base">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle size={28} className="text-success-500 flex-shrink-0" aria-hidden="true" />
              <h1 className="type-section-hed">Payment confirmed</h1>
            </div>
            <p className="type-section-sub tabular-nums">{amountPLN}</p>
            {paymentMethodHint && (
              <p className="type-section-caption">via {paymentMethodHint}</p>
            )}
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-text-caption flex-shrink-0" aria-hidden="true" />
              <span className="type-section-caption">Secured by Stripe</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg-touch:grid-cols-[3fr_2fr] lg-desktop:grid-cols-[3fr_2fr]">
          <div>
            <Suspense fallback={<OrderDetailsSkeleton />}>
              <OrderDetails paymentIntentId={payment_intent} fallbackTotal={pi.amount} />
            </Suspense>
          </div>
          <div className="flex flex-col gap-4">
            <div className="card-base">
              <h3 className="type-overline mb-4">What happens next</h3>
              <ol className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-success-500" />
                  <span className="type-body">Order confirmed</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" />
                  <span className="type-section-caption">Processing</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" />
                  <span className="type-section-caption">Shipped</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-secondary-700" />
                  <span className="type-section-caption">Delivered</span>
                </li>
              </ol>
              <p className="type-section-caption mt-3">Tracking number will appear here once shipped.</p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/" className="btn-primary block text-center py-3">Continue shopping</Link>
            </div>

            <div className="card-base">
              <h3 className="type-overline mb-2">Need help?</h3>
              <p className="type-section-caption mb-3">If you have any questions about your order, contact our support team.</p>
              <a
                href="mailto:support@sanglogium.com?subject=Order%20Support%20Request"
                className="btn-secondary inline-block px-4 py-2 text-sm"
              >
                Email support
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Failed branch
  if (pi.status === 'requires_payment_method') {
    const declineMessage =
      (pi as { last_payment_error?: { message?: string } }).last_payment_error?.message ??
      'Payment was declined.'
    return (
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <XCircle size={24} className="text-error-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">Payment was declined</h1>
            </div>
            <p className="type-body text-text-caption">{declineMessage}</p>
            <div className="flex flex-wrap gap-3">
              <a href="/checkout/payment" className="btn-primary px-6 py-2.5">Try again</a>
              <a href="/basket" className="btn-secondary px-6 py-2.5">Return to basket</a>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Canceled branch
  if (pi.status === 'canceled') {
    return (
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <XCircle size={24} className="text-secondary-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">Payment was canceled</h1>
            </div>
            <p className="type-body text-text-caption">You can try again or return to your basket.</p>
            <div className="flex flex-wrap gap-3">
              <a href="/checkout/payment" className="btn-primary px-6 py-2.5">Try again</a>
              <a href="/basket" className="btn-secondary px-6 py-2.5">Return to basket</a>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Processing branch
  if (pi.status === 'processing') {
    return (
      <div className="max-w-xl mx-auto">
        <section role="alert" className="card-base">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Clock size={24} className="text-accent-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <h1 className="type-section-sub">Payment is processing</h1>
            </div>
            <p className="type-body text-text-caption">
              Your payment is being processed by your bank. This usually takes a few minutes.
            </p>
            <p className="type-body text-text-caption">
              We&apos;ll email a confirmation once settled.
            </p>
            <code className="block font-mono type-caption text-brand-400 bg-surface-elevated rounded-md px-3 py-2">
              {payment_intent}
            </code>
            <div className="flex flex-wrap gap-3">
              <RefreshButton />
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Unexpected status — shouldn't reach here (Route Handler handles it), but safety net
  return (
    <div className="max-w-xl mx-auto">
      <section role="alert" className="card-base">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <WarningCircle size={24} className="text-error-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <h1 className="type-section-sub">Unexpected payment status</h1>
          </div>
          <p className="type-body text-text-caption">Contact support with this reference:</p>
          <code className="block font-mono type-caption text-brand-400 bg-surface-elevated rounded-md px-3 py-2">
            {payment_intent}
          </code>
          <div className="flex flex-wrap gap-3">
            <a href="/basket" className="btn-primary px-6 py-2.5">Return to basket</a>
          </div>
        </div>
      </section>
    </div>
  )
}
