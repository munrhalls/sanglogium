'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import { useCheckoutMachine } from '@/store/checkout/checkoutMachine';

interface PaymentFormClientProps {
  clientSecret: string;
  reservationId: string;
  expiresAt: number;
  amountPln: number;
}

export default function PaymentFormClient({
  clientSecret,
  reservationId,
  expiresAt,
  amountPln
}: PaymentFormClientProps) {
  const router = useRouter();
  const checkout = useCheckoutMachine();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Update checkout context with session data
    checkout.handleSuccess({
      clientSecret,
      reservationId,
      expiresAt
    });

    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [clientSecret, reservationId, expiresAt, checkout]);

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
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment</h1>
      <StripePaymentForm
        clientSecret={checkout.clientSecret}
        reservationId={checkout.reservationId}
        expiresAt={checkout.expiresAt}
        amountPln={amountPln}
      />
    </div>
  );
}
