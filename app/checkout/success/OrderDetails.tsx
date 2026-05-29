import { fetchOrderByPaymentIntentId } from '@/sanity-cms/lib/orders/getOrderByPaymentIntentId'
import Link from 'next/link'
import { RefreshButton } from './RefreshButton'

interface Props {
  paymentIntentId: string
  fallbackTotal: number
}

function formatPLN(cents: number): string {
  return (cents / 100).toLocaleString('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  })
}

export default async function OrderDetails({ paymentIntentId, fallbackTotal }: Props) {
  const order = await fetchOrderByPaymentIntentId(paymentIntentId)

  if (!order) {
    const fallbackPLN = formatPLN(fallbackTotal)
    return (
      <div className="rounded border border-gray-200 p-6 text-center">
        <p className="text-lg font-semibold">Payment successful — generating your invoice…</p>
        <p className="mt-1 text-gray-600">Amount charged: {fallbackPLN}</p>
        <RefreshButton />
      </div>
    )
  }

  const orderedAt = new Date(order.dates.orderedAt)
  const estimatedDelivery = order.shippingMethod?.estimatedDays
    ? new Date(orderedAt.getTime() + order.shippingMethod.estimatedDays * 24 * 60 * 60 * 1000)
    : null

  return (
    <div className="mt-6 rounded border border-gray-200 p-6">
      <h2 className="mb-4 text-xl font-semibold">Order Details</h2>

      <p className="mb-1 text-sm text-gray-500">
        Order: <span className="font-mono font-semibold text-gray-900">{order.orderNumber}</span>
      </p>
      <p className="mb-1 text-sm text-gray-500">
        Date: {orderedAt.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      {order.customerEmail && (
        <p className="mb-4 text-sm text-gray-500">
          Confirmation sent to: <span className="text-gray-900">{order.customerEmail}</span>
        </p>
      )}

      <div className="mb-4">
        <h3 className="mb-2 font-semibold">Items</h3>
        <ul className="space-y-2">
          {order.items.map((item, i) => {
            const unitPLN = formatPLN(item.price)
            const linePLN = formatPLN(item.subtotal)
            return (
              <li key={i} className="flex justify-between text-sm">
                <span>
                  {item.name} <span className="text-gray-500">× {item.quantity}</span>
                  <span className="ml-1 text-gray-400">({unitPLN} each)</span>
                </span>
                <span className="font-medium">{linePLN}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="space-y-1 border-t pt-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatPLN(order.pricing.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">
            Shipping
            {order.shippingMethod && (
              <span className="ml-1 text-gray-400">
                ({order.shippingMethod.carrier} — {order.shippingMethod.estimatedDays ?? '?'} {order.shippingMethod.estimatedDays === 1 ? 'day' : 'days'})
              </span>
            )}
          </span>
          <span>{formatPLN(order.pricing.shipping)}</span>
        </div>
        {order.pricing.tax > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>{formatPLN(order.pricing.tax)}</span>
          </div>
        )}
        {order.pricing.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Discount</span>
            <span className="text-green-600">-{formatPLN(order.pricing.discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-2 text-base font-bold">
          <span>Total</span>
          <span>{formatPLN(order.pricing.total)}</span>
        </div>
      </div>

      <div className="mt-4 rounded bg-gray-50 p-4 text-sm">
        <h3 className="mb-1 font-semibold">Shipping address</h3>
        <p>{order.shippingAddress.name}</p>
        <p>{order.shippingAddress.line1}</p>
        <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
        <p>{order.shippingAddress.state}</p>
        <p>{order.shippingAddress.country}</p>
      </div>

      <div className="mt-4 rounded bg-blue-50 p-4 text-sm">
        <h3 className="mb-2 font-semibold text-blue-800">What happens next?</h3>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          <span>Order confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
          <span>Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
          <span>Shipped</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-gray-300" />
          <span>Delivered</span>
        </div>
        {estimatedDelivery && (
          <p className="mt-2 text-blue-700">
            Estimated delivery: {estimatedDelivery.toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <p className="mt-1 text-gray-500">Tracking number will appear here once shipped.</p>
      </div>

      {order.isGuest && (
        <div className="mt-4 rounded border border-blue-100 bg-blue-50 p-4 text-sm">
          <p className="mb-1 font-semibold text-blue-800">Create an account to track your order</p>
          <p className="mb-3 text-gray-600">Save your details for faster checkout next time.</p>
          <Link
            href={`/sign-up${order.customerEmail ? `?email=${encodeURIComponent(order.customerEmail)}` : ''}`}
            className="inline-block rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Create account
          </Link>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {!order.isGuest && (
          <Link
            href="/account/orders"
            className="inline-block rounded border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            View my orders
          </Link>
        )}
        <Link
          href="/"
          className="inline-block rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
