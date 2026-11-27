import type { PaidPayment } from './types/adminTypes'

export type AdminLedgers = {
  listSucceededPayments: (createdSince: number) => Promise<PaidPayment[]>
  findOrderedPaymentIds: (paymentIntentIds: string[]) => Promise<string[]>
}
