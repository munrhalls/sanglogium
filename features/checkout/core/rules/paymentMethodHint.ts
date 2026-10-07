import type { PaymentMethodDetails } from '@/features/order'

export function getPaymentMethodHint(method: PaymentMethodDetails | null): string | null {
  const type = method?.type ?? 'unknown'
  const card = method?.card

  switch (type) {
    case 'blik':
      return 'BLIK'
    case 'p24':
      return 'Przelewy24'
    case 'paypal':
      return 'PayPal'
    case 'klarna':
      return 'Klarna'
    case 'link':
      return 'Link'
    case 'card': {
      const wallet = card?.walletType
      if (wallet === 'apple_pay') return 'Apple Pay'
      if (wallet === 'google_pay') return 'Google Pay'
      if (card?.brand && card?.last4) {
        const brand = card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
        return `${brand} ····${card.last4}`
      }
      return 'Card'
    }
    default:
      return type ?? null
  }
}
