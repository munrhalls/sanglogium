'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPaymentStatus } from '@/app/actions/checkout/getPaymentStatus';
import { useBasketStore } from '@/store/store';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const clearBasket = useBasketStore((state) => state.clearBasket);

  useEffect(() => {
    const verifyPayment = async () => {
      // Get payment intent ID from URL
      const paymentIntentId = searchParams.get('payment_intent');

      if (!paymentIntentId) {
        // No payment intent ID, redirect to home
        router.push('/');
        return;
      }

      try {
        // Verify payment status via Stripe API
        const status = await getPaymentStatus(paymentIntentId);
        setPaymentStatus(status);

        if (status.status === 'succeeded' || status.status === 'processing') {
          // Payment verified, clear basket
          clearBasket();
          setIsVerified(true);
        } else {
          // Payment not successful, redirect to basket with error
          router.push('/basket?error=payment_incomplete');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment');
        // Redirect to basket on error
        setTimeout(() => {
          router.push('/basket?error=verification_failed');
        }, 3000);
      }
    };

    verifyPayment();
  }, [searchParams, router, clearBasket]);

  if (!isVerified && !error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verification Error
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to basket...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed
          </h1>
          <p className="text-lg text-gray-600">
            Your order is being processed. You&apos;ll receive an email confirmation.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Reference:</span>
              <span className="font-medium">{searchParams.get('payment_intent')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium capitalize">{paymentStatus?.status || 'Verified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
