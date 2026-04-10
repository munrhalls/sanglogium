'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import { useCheckoutMachine } from '@/store/checkout/checkoutMachine';
import { getGuestSession } from '@/app/actions/checkout/reserveStock';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkout = useCheckoutMachine();

  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPaymentData = async () => {
      // Get sessionId from URL (idempotencyKey should be in FSM context)
      const sessionIdParam = searchParams.get('sessionId');

      if (!sessionIdParam) {
        // Missing required parameter, redirect to basket
        router.push('/basket');
        return;
      }

      setSessionId(sessionIdParam);

      // Get guest session data
      const guestSession = await getGuestSession(sessionIdParam);

      if (!guestSession || !guestSession.paymentIntentId || !guestSession.reservationId) {
        // No valid session, redirect to basket
        router.push('/basket');
        return;
      }

      // Update checkout context with session data
      checkout.handleSuccess({
        clientSecret: guestSession.clientSecret,
        reservationId: guestSession.reservationId,
        expiresAt: guestSession.expiresAt
      });

      setIsLoading(false);
    };

    loadPaymentData();
  }, [searchParams, router, checkout]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!checkout.clientSecret || !checkout.reservationId || !checkout.expiresAt) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Payment session not found</p>
          <button
            onClick={() => router.push('/basket')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Return to Basket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        <StripePaymentForm
          clientSecret={checkout.clientSecret}
          reservationId={checkout.reservationId}
          expiresAt={checkout.expiresAt}
        />
      </div>
    </div>
  );
}
