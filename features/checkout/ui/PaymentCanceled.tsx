import { XCircle } from '@phosphor-icons/react/dist/ssr'

export default function PaymentCanceled() {
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
