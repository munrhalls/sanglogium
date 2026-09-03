import { fetchOrderByPaymentIntentId } from '@/sanity-cms/lib/orders/getOrderByPaymentIntentId'
import Link from 'next/link'
import { Hourglass } from '@phosphor-icons/react/dist/ssr'
import { RefreshButton } from './RefreshButton'
import { formatPrice } from '@/lib/utils/price'

interface Props {
  paymentIntentId: string
  fallbackTotal: number
}

export default async function OrderDetails({ paymentIntentId, fallbackTotal }: Props) {
  const order = await fetchOrderByPaymentIntentId(paymentIntentId)

  if (!order) {
    const fallbackPLN = formatPrice(fallbackTotal)
    return (
      <div className="card-base text-center">
        <div className="flex flex-col items-center gap-4 py-4">
          <Hourglass size={32} className="text-accent-500" aria-hidden="true" />
          <p className="type-section-sub">Generating your order receipt…</p>
          <p className="type-body text-text-caption">Amount charged: {fallbackPLN}</p>
          <RefreshButton />
        </div>
      </div>
    )
  }

  const orderedAt = new Date(order.dates.orderedAt)

  return (
    <>
      <div className="card-base">
        <h2 className="type-section-sub border-b border-border-primary pb-4 mb-4">Order Details</h2>

        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2">
            <span className="type-overline">Order</span>
            <span className="type-caption font-mono text-brand-400">{order.orderNumber}</span>
          </div>
          <p className="type-section-caption">
            Date: {orderedAt.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {order.customerEmail && (
            <p className="type-section-caption">
              Confirmation sent to: <span className="text-brand-400">{order.customerEmail}</span>
            </p>
          )}
        </div>

        <div className="mt-4">
          <h3 className="type-overline border-b border-border-secondary pb-2 mb-3">Items</h3>
          <ul className="space-y-3">
            {order.items.map((item, i) => {
              const unitPLN = formatPrice(item.price)
              const linePLN = formatPrice(item.subtotal)
              return (
                <li key={i} className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="type-card-title line-clamp-2">{item.name}</p>
                    <p className="type-section-caption">
                      × {item.quantity}
                      <span className="ml-1">({unitPLN} each)</span>
                    </p>
                  </div>
                  <span className="type-price flex-shrink-0">{linePLN}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="space-y-1.5 border-t border-border-secondary pt-4 mt-4">
          <div className="flex justify-between items-baseline">
            <span className="type-section-caption">Subtotal</span>
            <span className="type-price">{formatPrice(order.pricing.subtotal)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="type-section-caption">
              Shipping
              {order.shippingMethod && (
                <span className="ml-1">
                  ({order.shippingMethod.carrier} — {order.shippingMethod.estimatedDays ?? '?'} {order.shippingMethod.estimatedDays === 1 ? 'day' : 'days'})
                </span>
              )}
            </span>
            <span className="type-price">{formatPrice(order.pricing.shipping)}</span>
          </div>
          {order.shippingMethod?.estimatedDays && order.dates.orderedAt && (
            <div className="flex justify-between items-baseline">
              <span className="type-section-caption">
                Estimated delivery
              </span>
              <span className="type-price text-brand-400">
                {(() => {
                  const orderedAt = new Date(order.dates.orderedAt)
                  const days = order.shippingMethod!.estimatedDays!
                  const from = new Date(orderedAt)
                  from.setDate(from.getDate() + days)
                  const to = new Date(orderedAt)
                  to.setDate(to.getDate() + days + 1)
                  const fmt = (d: Date) => d.toLocaleDateString('pl-PL', { month: 'long', day: 'numeric' })
                  return `${fmt(from)}–${fmt(to)}`
                })()}
              </span>
            </div>
          )}
          {order.pricing.discount > 0 && (
            <div className="flex justify-between items-baseline">
              <span className="type-section-caption">Discount</span>
              <span className="type-price text-success-500">-{formatPrice(order.pricing.discount)}</span>
            </div>
          )}
          {order.pricing.tax > 0 && (
            <div className="flex justify-between items-baseline">
              <span className="type-section-caption">Tax</span>
              <span className="type-price">{formatPrice(order.pricing.tax)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline border-t border-border-primary pt-3 mt-2">
            <span className="type-section-sub">Total</span>
            <span className="type-section-sub tabular-nums text-brand-400">{formatPrice(order.pricing.total)}</span>
          </div>
        </div>

        {order.shippingAddress?.city && (
          <div className="mt-4 rounded-md bg-surface-subtle border border-border-secondary p-4">
            <h3 className="type-overline mb-2">Shipping address</h3>
            <address className="not-italic space-y-0.5">
              <p className="type-body">{order.shippingAddress.name}</p>
              <p className="type-body">{order.shippingAddress.line1}</p>
              <p className="type-body">{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
              {order.shippingAddress.state && (
                <p className="type-section-caption">{order.shippingAddress.state}</p>
              )}
              <p className="type-section-caption">{order.shippingAddress.country}</p>
            </address>
          </div>
        )}
      </div>

      {order.isGuest && (
        <div className="card-product-dark p-6 mt-4">
          <p className="type-card-title">Create an account to track your order</p>
          <p className="type-section-caption mt-1 mb-3">Save your details for faster checkout next time.</p>
          <Link
            href={`/sign-up${order.customerEmail ? `?email=${encodeURIComponent(order.customerEmail)}` : ''}`}
            className="btn-primary block text-center py-3"
          >
            Create account
          </Link>
        </div>
      )}

      {!order.isGuest && (
        <div className="flex flex-col gap-3 mt-4">
          <Link href="/account/orders" className="btn-secondary block text-center py-3">
            View my orders
          </Link>
        </div>
      )}
    </>
  )
}
