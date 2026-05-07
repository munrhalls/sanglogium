'use client';

import { useState, useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '@/app/components/features/checkout/PaymentForm';
import { stripePromise } from '@/lib/stripe-promise';

interface StripePaymentFormProps {
  clientSecret: string;
  reservationId: string;
  expiresAt: number;
  amountPln: number;
}

export default function StripePaymentForm({
  clientSecret,
  reservationId,
  expiresAt,
  amountPln
}: StripePaymentFormProps) {
  const [isExpired, setIsExpired] = useState(false);

  // Check if expired
  useMemo(() => {
    if (Date.now() > expiresAt) {
      setIsExpired(true);
    }
  }, [expiresAt]);

  if (isExpired) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">
          Your reservation has expired. Please return to the basket to try again.
        </p>
        <a
          href="/basket"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Return to Basket
        </a>
      </div>
    );
  }

  // B-1: useMemo on options prevents StripeElements remount bug
  const options = useMemo(
    () => ({
      clientSecret,
      appearance: { theme: 'stripe' }
    }),
    [clientSecret]   // Prevents StripeElements remount bug B-1
  );

  // B-3: Only render Elements when clientSecret exists (prevents B-3)
  return clientSecret ? (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        reservationId={reservationId}
        expiresAt={expiresAt}
        amountPln={amountPln}
      />
    </Elements>
  ) : (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
