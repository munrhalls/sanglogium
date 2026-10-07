import { getSuccessPageResult, getOrderByPaymentIntentId } from '@/features/checkout/server'
import { PaymentConfirmedView } from '@/features/checkout/server'
import { PaymentVerificationFailed, PaymentDeclined, PaymentCanceled, PaymentProcessing, PaymentUnexpectedStatus } from '@/features/checkout'

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

  const result = await getSuccessPageResult({
    paymentIntent: payment_intent,
    errorParam: error,
  })

  switch (result.kind) {
    case 'verificationFailed':
      return <PaymentVerificationFailed paymentIntentId={result.paymentIntentId} />
    case 'succeeded':
      return (
        <PaymentConfirmedView
          paymentIntentId={result.paymentIntentId}
          amount={result.amount}
          paymentMethod={result.paymentMethod}
          orderPromise={getOrderByPaymentIntentId(result.paymentIntentId)}
        />
      )
    case 'declined':
      return <PaymentDeclined message={result.message} />
    case 'canceled':
      return <PaymentCanceled />
    case 'processing':
      return <PaymentProcessing paymentIntentId={result.paymentIntentId} />
    default:
      return <PaymentUnexpectedStatus paymentIntentId={result.paymentIntentId} />
  }
}
