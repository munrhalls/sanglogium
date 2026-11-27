export type PaidPayment = {
  id: string
  amount: number
  currency: string
  created: number
}

export type PaymentWithoutOrder = {
  paymentIntentId: string
  amount: number
  currency: string
  createdAt: string
}
