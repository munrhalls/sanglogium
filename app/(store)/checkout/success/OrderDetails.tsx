import { fetchOrderByPaymentIntentId } from '@/sanity-cms/lib/orders/getOrderByPaymentIntentId'
import Link from 'next/link'
import { RefreshButton } from './RefreshButton'

interface Props {
  paymentIntentId: string
  fallbackTotal: number
}

export default async function OrderDetails({ paymentIntentId, fallbackTotal }: Props) {
  const order = await fetchOrderByPaymentIntentId(paymentIntentId)

  if (!order) {
    const fallbackPLN = (fallbackTotal / 100).toLocaleString('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    })
    return (
      <div className="rounded border border-gray-200 p-6 text-center">
        <p className="text-lg font-semibold">Payment successful — generating your invoice…</p>
        <p className="mt-1 text-gray-600">Amount charged: {fallbackPLN}</p>
        <RefreshButton />
      </div>
    )
  }

  const totalPLN = (order.pricing.total / 100).toLocaleString('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  })

  return (
    <div className="mt-6 rounded border border-gray-200 p-6">
      <h2 className="mb-4 text-xl font-semibold">Order Details</h2>

      <p className="mb-1 text-sm text-gray-500">Order ID: <span className="font-mono text-gray-900">{order._id}</span></p>
      <p className="mb-4 text-sm text-gray-500">
        Date: {new Date(order.dates.orderedAt).toLocaleDateString('pl-PL', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}
      </p>

      <h3 className="mb-2 font-semibold">Items</h3>
      <ul className="mb-4 space-y-2">
        {order.items.map((item, i) => {
          const linePLN = (item.subtotal / 100).toLocaleString('pl-PL', {
            style: 'currency',
            currency: 'PLN',
          })
          return (
            <li key={i} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>{linePLN}</span>
            </li>
          )
        })}
      </ul>

      <div className="flex justify-between border-t pt-3 font-bold">
        <span>Total</span>
        <span>{totalPLN}</span>
      </div>

      <div className="mt-4 rounded bg-gray-50 p-4 text-sm">
        <h3 className="mb-1 font-semibold">Shipping address</h3>
        <p>{order.shippingAddress.name}</p>
        <p>{order.shippingAddress.line1}</p>
        <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
        <p>{order.shippingAddress.state}</p>
        <p>{order.shippingAddress.country}</p>
      </div>

      <div className="mt-6">
        <Link
          href="/basket"
          className="inline-block rounded bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
