"use client";

import { useState, useEffect, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  ExpressCheckoutElement,
  PaymentMethodMessagingElement,
} from "@stripe/react-stripe-js";
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

function PaymentFormInner({
  address,
  traceId,
  grandTotal,
}: {
  address: Address;
  traceId: string;
  grandTotal: number;
}) {
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
          data: { error: error.message, type: error.type }
        })
      })

      // Only show custom error for API/system failures
      // card_error and validation_error are displayed natively by PaymentElement
      if (error.type === 'api_error') {
        setError(error.message ?? "A payment system error occurred. Please try again later.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <ExpressCheckoutElement
        options={{
          buttonHeight: 44,
          buttonTheme: { applePay: 'black', googlePay: 'black' },
          layout: { maxColumns: 2 },
        }}
        onConfirm={async () => {
          if (!stripe || !elements) return;
          await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/api/checkout/return`,
            },
          });
        }}
      />
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
      <div className="flex flex-col items-center gap-2 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Secure payment encrypted by Stripe
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-medium">Visa</span>
          <span>·</span>
          <span className="font-medium">Mastercard</span>
          <span>·</span>
          <span className="font-medium">BLIK</span>
        </div>
      </div>
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
        {grandTotal >= 5000 && grandTotal <= 500000 && (
          <div className="mb-4">
            <PaymentMethodMessagingElement
              options={{
                amount: grandTotal,
                currency: 'PLN',
                paymentMethodTypes: ['klarna'],
              }}
            />
          </div>
        )}
        <PaymentFormInner address={address} traceId={traceId} grandTotal={grandTotal} />
      </Elements>
    </div>
  );
}
