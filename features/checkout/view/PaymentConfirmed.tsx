import { Suspense } from 'react'
import type Stripe from 'stripe'
import { CheckCircle, Lock } from '@phosphor-icons/react/dist/ssr'
import type { OrderForSuccessPage } from '@/features/checkout/core/rules/checkoutTypes'
import OrderDetails from './OrderDetails'
import OrderDetailsSkeleton from '@/features/checkout/ui/OrderDetailsSkeleton'
import OrderNextSteps from '@/features/checkout/ui/OrderNextSteps'
import { SuccessAnalytics } from '@/features/checkout/ui/SuccessAnalyticsClient'
import { getPaymentMethodHint } from '@/features/checkout/core/rules/paymentMethodHint'
import { formatPrice } from '@/platform/utils/price'

interface Props {
  paymentIntentId: string
  amount: number
  latestCharge: Stripe.PaymentIntent['latest_charge']
  orderPromise: Promise<OrderForSuccessPage | null>
}

export default function PaymentConfirmed({ paymentIntentId, amount, latestCharge, orderPromise }: Props) {
  const amountFormatted = formatPrice(amount)
  const paymentMethodHint = getPaymentMethodHint(latestCharge)

  return (
    <section aria-label="Order confirmation" className="flex flex-col gap-6">
      <SuccessAnalytics transactionId={paymentIntentId} value={amount} />
      <div className="card-base">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle size={28} className="text-success-500 flex-shrink-0" aria-hidden="true" />
            <h1 className="type-section-hed">Payment confirmed</h1>
          </div>
          <p className="type-section-sub tabular-nums">{amountFormatted}</p>
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
            <OrderDetails orderPromise={orderPromise} fallbackTotal={amount} />
          </Suspense>
        </div>
        <OrderNextSteps />
      </div>
    </section>
  )
}
