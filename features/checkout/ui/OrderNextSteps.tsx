import Link from 'next/link'

export default function OrderNextSteps() {
  return (
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
            <span className="type-section-caption">Delivery</span>
          </li>
        </ol>
        <p className="type-section-caption mt-3">Estimated delivery date shown in order details below. Tracking number will appear here once shipped.</p>
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/" className="btn-primary block text-center py-3">Continue shopping</Link>
        <Link href="/account/orders" className="btn-secondary block text-center py-3">View my orders</Link>
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
  )
}
