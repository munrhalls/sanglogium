import type Stripe from 'stripe'

export function getPaymentMethodHint(latestCharge: Stripe.PaymentIntent['latest_charge']): string | null {
  const charge =
    typeof latestCharge === 'object' && latestCharge !== null
      ? latestCharge
      : null
  // M-02: use charge.payment_method_details.type instead of payment_method_types[0]
  const type = charge?.payment_method_details?.type ?? 'unknown'
  const card = charge?.payment_method_details?.card

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
      const wallet = card?.wallet?.type
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
