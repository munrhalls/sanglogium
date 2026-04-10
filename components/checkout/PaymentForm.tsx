'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useCheckoutMachine } from '@/store/checkout/checkoutMachine';

interface PaymentFormProps {
  reservationId: string;
  expiresAt: number;
}

export default function PaymentForm({
  reservationId,
  expiresAt
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const checkout = useCheckoutMachine();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Update FSM status
    checkout.submitPayment();

    try {
      // Step 18: Validate form + collect wallets (required for Apple Pay/Google Pay)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        // FSM status: 'idle', errorMessage: submitError.message
        checkout.handleError(submitError.message);
        setErrorMessage(submitError.message);
        setIsProcessing(false);
        return;
      }

      // Step 19: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: checkout.clientSecret!,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',  // Keep card payments in-app (prevents redirect)
      });

      // Step 20: Client response handling
      if (error) {
        // ERROR (immediate) -> FSM status: 'idle', errorMessage: error.message
        checkout.handleError(error.message || 'Payment failed');
        setErrorMessage(error.message || 'Payment failed');
      } else if (paymentIntent) {
        // SUCCESS (paymentIntent.status === 'succeeded' OR 'processing') -> FSM status: 'complete'
        checkout.handleSuccess({
          clientSecret: checkout.clientSecret!,
          reservationId,
          expiresAt
        });
        
        // Navigate to /checkout/success
        router.push('/checkout/success');
      }

    } catch (error) {
      console.error('Payment error:', error);
      checkout.handleError('An unexpected error occurred');
      setErrorMessage('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   hover:bg-blue-700 transition-colors"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${(parseFloat(checkout.clientSecret || '0') / 100).toFixed(2)}`
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        Your reservation expires at {new Date(expiresAt).toLocaleString()}
      </div>
    </form>
  );
}
