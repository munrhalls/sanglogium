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

import { formatPrice } from "@/lib/utils/price";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Brand-aligned Stripe appearance — matches the dark design system
// Tokens sourced from tailwind.config.ts
const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary: '#F6E3D5',       // brand-400 (interactive focus)
    colorBackground: '#2E2E2D',    // surface.elevated (input bg)
    colorText: '#FAEEE6',          // brand-200 (body text)
    colorTextSecondary: '#9A9997', // secondary-500 (placeholders/labels)
    colorDanger: '#EF4444',        // error-500
    borderRadius: '3px',           // tailwind borderRadius.md
    fontFamily: 'Montserrat, system-ui, sans-serif',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': {
      backgroundColor: '#2E2E2D',  // surface.elevated
      border: '1px solid #4A4948', // border.secondary
      color: '#FAEEE6',            // brand-200
    },
    '.Input:focus': {
      border: '1px solid #F6E3D5', // brand-400
      boxShadow: 'none',
    },
    '.Label': {
      color: '#E5E4E2',            // secondary-300
    },
    '.Tab': {
      backgroundColor: '#2E2E2D',
      border: '1px solid #4A4948',
      color: '#9A9997',
    },
    '.Tab:hover': {
      color: '#FAEEE6',
    },
    '.Tab--selected': {
      backgroundColor: '#2E2E2D',
      border: '1px solid #F6E3D5',
      color: '#FAEEE6',
    },
    '.TabIcon--selected': {
      fill: '#F6E3D5',
    },
    '.Block': {
      backgroundColor: '#1A1A19',  // surface.card
      border: '1px solid #4A4948',
    },
  },
};

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

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔍 LIVE AUDIT CHECK — PaymentForm (Client)");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ FIX #8  — Pay button weight:        btn-cart-large with py-4 rendered");
      console.log("✅ FIX #12 — Security badge:            positioned above Pay button");
      console.log("✅ FIX #14 — BLIK divider:              'Or choose another payment method' text active");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  }, []);

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);
    if (process.env.NODE_ENV !== 'production') {
      console.log("[PaymentForm] handlePay triggered — confirming payment…");
    }

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

  const payButtonLabel = isLoading
    ? (
      <span className="flex items-center justify-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
        Processing…
      </span>
    )
    : `Pay · ${formatPrice(grandTotal)}`;

  return (
    <>
      <div className="card-base space-y-6 pb-28 lg-touch:pb-6 lg-desktop:pb-6">
        <ExpressCheckoutElement
          options={{
            buttonHeight: 44,
            buttonTheme: { applePay: 'black', googlePay: 'black' },
            layout: { maxColumns: 4 },
          }}
          onConfirm={async () => {
            if (!stripe || !elements) return;
            // H-03: Pass billing_details from session address, same as handlePay
            const billing_details = {
              address: {
                line1: `${address.street} ${address.streetNumber}`,
                postal_code: address.postalCode,
                city: address.city,
                state: address.regionCode,
                country: "PL",
              },
            };
            await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: `${window.location.origin}/api/checkout/return`,
                payment_method_data: { billing_details },
              },
            });
          }}
        />
        <div className="border-t border-border-secondary pt-4">
          <p className="mb-3 text-center type-caption text-text-caption">Or choose another payment method</p>
          <PaymentElement options={{ paymentMethodOrder: ['blik', 'p24', 'card'], fields: { billingDetails: { address: "never" } } }} />
        </div>
        {error && (
          <div className="rounded border border-error-500/30 bg-error-500/10 px-3 py-2 mt-2">
            <p className="type-caption text-error-500">{error}</p>
          </div>
        )}
        {/* Security trust signal — positioned at peak anxiety point, just above Pay button */}
        <div className="flex items-center justify-center gap-1.5 type-caption text-text-caption">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success-500">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Secure payment encrypted by Stripe
        </div>
        {/* Form-card Pay button — hidden on mobile (sticky bar is primary CTA) */}
        <button
          onClick={handlePay}
          disabled={isLoading || !stripe || !elements}
          className="btn-cart-large w-full justify-center py-4 hidden lg-touch:block lg-desktop:block"
        >
          {payButtonLabel}
        </button>
        <div className="flex items-center justify-center gap-2 type-caption text-text-secondary pt-2">
          <span className="font-medium">Visa</span>
          <span>·</span>
          <span className="font-medium">Mastercard</span>
          <span>·</span>
          <span className="font-medium">BLIK</span>
        </div>
      </div>

      {/* Mobile sticky Pay bar */}
      <div
        className="lg-touch:hidden lg-desktop:hidden fixed bottom-0 left-0 w-full z-50 bg-brand-700 border-t border-border-secondary px-4 py-3"
        style={{ boxShadow: "0 -4px 16px rgba(0,0,0,0.3)" }}
      >
        <button
          onClick={handlePay}
          disabled={isLoading || !stripe || !elements}
          className="btn-cart-large w-full justify-center py-4"
        >
          {payButtonLabel}
        </button>
      </div>
    </>
  );
}

export default function PaymentForm({ grandTotal, metadata, address, traceId }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // H-04: Retry with exponential backoff before surfacing error to user
  const initPayment = useCallback(
    async (meta: Record<string, string>) => {
      const maxAttempts = 3;
      const delays = [500, 1000, 2000];

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const res = await fetch("/api/checkout/payment-intent-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grandTotal, metadata: meta }),
          });
          const data = await res.json();
          if (data.error) {
            setError(data.error);
            return;
          }
          setClientSecret(data.clientSecret);
          return;
        } catch {
          if (attempt < maxAttempts - 1) {
            await new Promise((r) => setTimeout(r, delays[attempt]));
          }
        }
      }
      setError("Failed to initialize payment.");
    },
    [grandTotal]
  );

  // C-03: Include metadata and initPayment in deps to prevent stale closure on re-entry
  useEffect(() => {
    initPayment(metadata);
  }, [initPayment, metadata]);

  if (error) return (
    <div className="card-base">
      <h2 className="type-section-hed mb-4">Payment Error</h2>
      <p className="type-body text-text-secondary">{error}</p>
      <div className="flex gap-4 mt-6">
        <button onClick={() => window.location.reload()} className="btn-cart-large">
          Try Again
        </button>
        <button onClick={() => window.location.href = "/checkout/shipping"} className="btn-secondary">
          Go Back
        </button>
      </div>
    </div>
  );
  if (!clientSecret) return (
    <div className="card-base space-y-4">
      <div className="h-11 rounded-sm bg-surface-elevated animate-pulse" />
      <div className="h-px bg-border-secondary mt-4 mb-4" />
      <div className="h-10 rounded-sm bg-surface-elevated animate-pulse mb-3" />
      <div className="h-10 rounded-sm bg-surface-elevated animate-pulse mb-3" />
      <div className="h-10 rounded-sm bg-surface-elevated animate-pulse mb-3" />
      <div className="h-14 rounded-sm bg-surface-elevated animate-pulse mt-6" />
      <p className="type-caption text-text-caption text-center mt-2">Preparing secure payment…</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance, defaultValues: { billingDetails: { email: metadata.email } } } as any}>
        {grandTotal >= 5000 && (
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
