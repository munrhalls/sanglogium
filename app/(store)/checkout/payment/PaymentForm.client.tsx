"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { saveEmailToSession } from "@/app/actions/checkout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Address {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
}

interface PaymentFormProps {
  grandTotal: number;
  metadata: Record<string, string>;
  address: Address;
  traceId: string;
}

function EmailInput({
  email,
  onChange,
  disabled,
}: {
  email: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="checkout-email"
        type="email"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="you@example.com"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
      />
    </div>
  );
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

export default function PaymentForm({ grandTotal, metadata, address, traceId }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(metadata.email ?? "");
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const initPayment = useCallback(
    async (meta: Record<string, string>) => {
      try {
        const res = await fetch("/api/checkout/payment-intent-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grandTotal, metadata: meta }),
        });
        const data = await res.json();
        if (data.error) setError(data.error);
        else setClientSecret(data.clientSecret);
      } catch {
        setError("Failed to initialize payment.");
      }
    },
    [grandTotal]
  );

  useEffect(() => {
    initPayment(metadata);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEmailChange = async (value: string) => {
    setEmail(value);
    setIsSavingEmail(true);
    await saveEmailToSession(value);
    setIsSavingEmail(false);
    // Re-sync PI metadata with updated email
    await initPayment({ ...metadata, email: value });
  };

  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!clientSecret) return <p>Loading payment form…</p>;

  return (
    <div className="space-y-6">
      <EmailInput email={email} onChange={handleEmailChange} disabled={isSavingEmail} />
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentFormInner address={address} traceId={traceId} />
      </Elements>
    </div>
  );
}
