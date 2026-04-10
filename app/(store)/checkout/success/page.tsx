'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      // Get payment intent ID from URL
      const paymentIntentId = searchParams.get('payment_intent');
      
      if (!paymentIntentId) {
        // No payment intent ID, redirect to basket
        router.push('/basket');
        return;
      }

      // In a real implementation, you would:
      // 1. Call your API to verify the payment was successful
      // 2. Get the order ID from your database
      // 3. Show order confirmation details
      
      // For now, we'll simulate verification
      setTimeout(() => {
        setOrderId(`ORD-${Date.now()}`);
        setIsVerified(true);
      }, 1000);
    };

    verifyPayment();
  }, [searchParams, router]);

  if (!isVerified) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg">Verifying your payment...</p>
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
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've sent a confirmation email with your order details.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-medium">{searchParams.get('payment_intent')}</span>
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
          <div className="block">
            <Link
              href="/account/orders"
              className="text-blue-600 hover:text-blue-700"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
