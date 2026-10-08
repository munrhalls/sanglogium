'use client'

import { BasketManager } from '@/features/basket'
import { CheckoutButton } from './CheckoutButton'

export function BasketCheckout() {
  return (
    <BasketManager
      renderCheckout={(basketData, disabled) => <CheckoutButton basketData={basketData} disabled={disabled} />}
    />
  )
}
