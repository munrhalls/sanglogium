import { WarningCircle } from '@phosphor-icons/react/dist/ssr'

export default function PaymentVerificationFailed({ paymentIntentId }: { paymentIntentId: string }) {
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
            {paymentIntentId}
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
