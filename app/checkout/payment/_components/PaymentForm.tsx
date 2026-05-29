"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import Loader from "@/app/components/common/Loader";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  totalAmount: number;
  currency: string;
}

function PaymentFormContent({ totalAmount, currency }: { totalAmount: number; currency: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/return?payment_intent={CHECKOUT_SESSION_ID}`,
      },
    });

    if (error) {
      console.error("Payment confirmation error:", error);
      setProcessing(false);
    }
    // If successful, Stripe will redirect to return_url
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </span>
        ) : (
          `Pay ${formatPrice(totalAmount)}`
        )}
      </button>
    </form>
  );
}

export default function PaymentForm({ clientSecret, totalAmount, currency }: PaymentFormProps) {
  if (!clientSecret) {
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormContent totalAmount={totalAmount} currency={currency} />
    </Elements>
  );
}
