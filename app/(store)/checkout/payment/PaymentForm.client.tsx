"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Address {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
}

interface PaymentFormProps {
  clientSecret: string;
  address: Address;
  traceId: string;
}

function PaymentFormInner({ address, traceId }: { address: Address; traceId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    // Log payment submission start (frontend)
    await fetch('/api/trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traceId,
        step: 'payment_submit_start',
        data: { hasStripe: !!stripe, hasElements: !!elements }
      })
    })

    const { error: submitError } = await elements.submit();
    if (submitError) {
      await fetch('/api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traceId,
          step: 'payment_submit_error',
          data: { error: submitError.message }
        })
      })
      setError(submitError.message ?? "Please check your payment details.");
      setIsLoading(false);
      return;
    }

    const billing_details = {
      address: {
        line1: `${address.street} ${address.streetNumber}`,
        postal_code: address.postalCode,
        city: address.city,
        state: address.regionCode,
        country: "PL",
      },
    };

    // Log confirmPayment call (frontend)
    await fetch('/api/trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traceId,
        step: 'payment_confirm_call',
        data: { returnUrl: `${window.location.origin}/api/checkout/return` }
      })
    })

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/api/checkout/return`,
        payment_method_data: { billing_details },
      },
    });

    if (error) {
      await fetch('/api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traceId,
          step: 'payment_confirm_error',
          data: { error: error.message }
        })
      })
    }

    setError(error?.message ?? "Payment failed. Please try again.");
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <PaymentElement options={{ fields: { billingDetails: { address: "never" } } }} />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <button
        onClick={handlePay}
        disabled={isLoading || !stripe || !elements}
        className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing…
          </span>
        ) : (
          "Pay"
        )}
      </button>
    </div>
  );
}

export default function PaymentForm({ clientSecret, address, traceId }: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[CLIENT] PaymentForm mount', { hasClientSecret: !!clientSecret });
    if (!clientSecret) {
      setError('No client secret provided');
      console.error('[CLIENT] PaymentForm error: No client secret');
    }
  }, [clientSecret]);

  if (!clientSecret) return <p>Loading payment form…</p>;

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormInner address={address} traceId={traceId} />
    </Elements>
  );
}
