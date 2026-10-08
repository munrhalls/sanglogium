import { Clock } from '@phosphor-icons/react/dist/ssr'
import { RefreshButton } from '@/features/checkout/ui/RefreshButton'

export default function PaymentProcessing({ paymentIntentId }: { paymentIntentId: string }) {
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
            {paymentIntentId}
          </code>
          <div className="flex flex-wrap gap-3">
            <RefreshButton />
          </div>
        </div>
      </section>
    </div>
  )
}
