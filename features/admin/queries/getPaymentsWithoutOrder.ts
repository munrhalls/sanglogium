import type { AdminLedgers } from '@/features/admin/core/ports'
import type { PaymentWithoutOrder } from '@/features/admin/core/types/adminTypes'

// Paid Stripe payments of the last 30 days that have no order in Sanity, newest first.
export async function getPaymentsWithoutOrder(
  ports: AdminLedgers,
  now: number
): Promise<PaymentWithoutOrder[]> {
  const createdSince = Math.floor(now / 1000) - 30 * 24 * 60 * 60
  const payments = await ports.listSucceededPayments(createdSince)
  if (payments.length === 0) return []
  const orderedIds = await ports.findOrderedPaymentIds(payments.map((p) => p.id))
  return payments
    .filter((p) => !orderedIds.includes(p.id))
    .sort((a, b) => b.created - a.created)
    .map((p) => ({
      paymentIntentId: p.id,
      amount: p.amount,
      currency: p.currency,
      createdAt: new Date(p.created * 1000).toISOString(),
    }))
}
