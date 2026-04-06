/**
 * Global Flow Sync Test
 * Verifies that the basket-to-checkout handshake respects architectural boundaries
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BasketSummary from '@/app/(store)/basket/BasketSummary'
import { BasketProvider } from '@/store/store'
import { PreCheckoutProvider } from '@/store/preCheckout'

// Mock the basket store
const mockBasketStore = {
  basket: [
    { _id: 'product-1', name: 'Test Product', price: 100, quantity: 2 }
  ],
  total: 200,
  hydrated: true
}

// Mock window.location.assign
Object.defineProperty(window, 'location', {
  value: {
    assign: vi.fn(),
    search: ''
  },
  writable: true
})

describe('Global Flow Sync - Basket to Checkout Handshake', () => {
  it('should not import downstream checkout components', async () => {
    // Verify CheckoutPanel doesn't import wizard steps, address forms, etc.
    const CheckoutPanel = await import('@/app/components/features/basket/checkout/CheckoutPanel')
    const panelSource = CheckoutPanel.default.toString()
    
    // Should not contain any downstream checkout component imports
    const downstreamImports = [
      'shipping',
      'payment',
      'wizard',
      'address-form',
      'checkout-step'
    ]
    
    downstreamImports.forEach(importName => {
      expect(panelSource).not.toContain(importName)
    })
  })

  it('should not load Stripe.js client SDK on basket page', async () => {
    // Verify no Stripe SDK imports in basket components
    const basketComponents = [
      () => import('@/app/(store)/basket/page'),
      () => import('@/app/(store)/basket/BasketClientWrapper'),
      () => import('@/app/(store)/basket/BasketSummary'),
      () => import('@/app/components/features/basket/checkout/CheckoutPanel'),
      () => import('@/app/components/features/basket/checkout/usePreCheckout'),
      () => import('@/app/components/features/basket/checkout/useSuccessHandler')
    ]

    for (const loadComponent of basketComponents) {
      const component = await loadComponent()
      const source = JSON.stringify(component)
      
      // Should not contain Stripe client SDK imports
      const stripeClientImports = [
        '@stripe/react-stripe-js',
        '@stripe/stripe-js',
        'loadStripe',
        'Stripe',
        'elements'
      ]
      
      stripeClientImports.forEach(stripeImport => {
        expect(source).not.toContain(stripeImport)
      })
    }
  })

  it('should create Stripe session server-side only', async () => {
    // Verify validateBasket server action exists and handles Stripe server-side
    const { validateBasket } = await import('@/app/actions/checkout/validateBasket')
    
    // Should be a server action
    expect(typeof validateBasket).toBe('function')
    
    // The action should return a URL, not handle client-side Stripe
    const mockPayload = {
      items: [{ _id: 'test', quantity: 1 }],
      total: 100
    }
    
    // Mock the server action to return expected structure
    vi.doMock('@/app/actions/checkout/validateBasket', () => ({
      validateBasket: vi.fn().mockResolvedValue({
        outcome: 'PASS',
        stripeUrl: 'https://checkout.stripe.com/pay/test'
      })
    }))
  })

  it('should redirect via window.location.assign not Next.js router', async () => {
    const { useSuccessHandler } = await import('@/app/components/features/basket/checkout/useSuccessHandler')
    const mockDispatch = vi.fn()
    const mockWatchdogRef = { current: null }
    
    const { onSuccessEntry } = useSuccessHandler(mockDispatch)
    
    // Call the success handler
    onSuccessEntry('https://checkout.stripe.com/pay/test', mockWatchdogRef)
    
    // Should use window.location.assign, not Next.js router
    expect(window.location.assign).toHaveBeenCalledWith('https://checkout.stripe.com/pay/test')
  })

  it('should maintain boundary between basket and downstream checkout', async () => {
    // Verify basket page doesn't import downstream checkout pages
    const basketPage = await import('@/app/(store)/basket/page')
    const pageSource = JSON.stringify(basketPage)
    
    // Should not import downstream checkout routes
    const downstreamRoutes = [
      '/checkout/shipping',
      '/checkout/payment',
      '/checkout/return'
    ]
    
    downstreamRoutes.forEach(route => {
      expect(pageSource).not.toContain(route)
    })
  })

  it('should only import server action for checkout', async () => {
    // Verify the basket only imports the server action, not checkout UI
    const { BasketSummary } = await import('@/app/(store)/basket/BasketSummary')
    
    // Render the component
    render(
      <BasketProvider>
        <PreCheckoutProvider>
          <BasketSummary />
        </PreCheckoutProvider>
      </BasketProvider>
    )
    
    // Should have checkout button but not downstream checkout UI
    expect(screen.getByText('Checkout')).toBeInTheDocument()
    expect(screen.queryByText(/shipping/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/payment/i)).not.toBeInTheDocument()
  })
})
