'use client';

import { useRouter } from 'next/navigation';
import { useCheckoutMachine } from '@/store/checkout/checkoutMachine';
import { useBasketStore } from '@/store/store';

/**
 * useCheckoutFlow - Hook for the simplified checkout flow
 * Follows UX slice implementation
 */
export function useCheckoutFlow() {
  const router = useRouter();
  const basket = useBasketStore((s) => s.basket);
  const checkout = useCheckoutMachine();

  const startCheckout = () => {
    // Step 1: Generate FRESH idempotency key
    const idempotencyKey = checkout.startCheckout();

    // Step 2: Check JWT (create if missing) - handled by middleware
    // Step 3: Create/verify guest cookie session
    const sessionId = getOrCreateGuestSession();

    // Step 5: Disable checkout button, show loading state (handled by FSM)
    // Step 6: Store key in FSM context (handled by checkout.startCheckout)

    // Step 7: Validate basket locally (quick checks)
    const validation = validateBasketLocally(basket);
    if (!validation.valid) {
      checkout.handleError(validation.error!);
      return;
    }

    // Step 8: Navigate to address page with idempotencyKey in URL
    router.push(`/checkout/address?sessionId=${sessionId}&idempotencyKey=${idempotencyKey}`);
  };

  return {
    startCheckout,
    isProcessing: checkout.isProcessing,
    hasError: checkout.hasError,
    errorMessage: checkout.errorMessage
  };
}

function getOrCreateGuestSession(): string {
  // Check if guest session exists
  const cookies = document.cookie.split('; ');
  const sessionCookie = cookies.find(row => row.startsWith('guest_session='));

  if (sessionCookie) {
    return sessionCookie.split('=')[1];
  }

  // Create new guest session ID
  const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Set cookie (expires in 24 hours)
  document.cookie = `guest_session=${sessionId}; path=/; max-age=86400; SameSite=Lax`;

  return sessionId;
}

function validateBasketLocally(basket: any[]) {
  if (!basket || basket.length === 0) {
    return { valid: false, error: 'Your basket is empty' };
  }

  // Check all items have required fields
  for (const item of basket) {
    if (!item._id || !item.quantity) {
      return { valid: false, error: 'Basket data is invalid' };
    }

    if (item.quantity <= 0) {
      return { valid: false, error: 'Invalid quantities in basket' };
    }
  }

  return { valid: true };
}
