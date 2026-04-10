'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckoutMachine } from '@/store/checkout/checkoutMachine';
import { reserveStock } from '@/app/actions/checkout/reserveStock';
import { getGuestSession, clearGuestSession } from '@/app/actions/checkout/reserveStock';

interface AddressFormProps {
  sessionId: string;
  basketData: Array<{
    _id: string;
    quantity: number;
    stripePriceId: string;
  }>;
}

export default function AddressForm({ sessionId, basketData }: AddressFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const checkout = useCheckoutMachine();

  const [formData, setFormData] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.street || !formData.city || !formData.postalCode || !formData.country) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Get idempotency key from session storage (not URL!)
    const idempotencyKey = sessionStorage.getItem('checkout_idempotencyKey');
    if (!idempotencyKey) {
      setErrorMessage('Session expired. Please start checkout again.');
      setIsProcessing(false);
      return;
    }

    try {
      console.log('=== Address Form Submission ===');
      console.log('idempotencyKey:', idempotencyKey);
      console.log('sessionId:', sessionId);
      console.log('addressData:', formData);
      console.log('basketData:', basketData);

      // Call server action with idempotency key
      const response = await reserveStock({
        idempotencyKey,
        sessionId,
        addressData: formData,
        basketData
      });

      console.log('reserveStock response:', response);

      if (response.success) {
        // Update FSM context with response data
        checkout.handleSuccess({
          clientSecret: response.clientSecret,
          reservationId: response.reservationId,
          expiresAt: response.expiresAt
        });

        // Navigate to payment page
        router.push(`/checkout/payment?sessionId=${sessionId}`);
      } else {
        // Handle error
        const errorMsg = response.error?.message || 'Failed to process address';
        checkout.handleError(errorMsg);
        setErrorMessage(errorMsg);
      }

    } catch (error) {
      console.error('=== Address Submission Error ===');
      console.error('Error details:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'No error message');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('=== End Error Details ===');

      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      checkout.handleError(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing}
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
            'Continue to Payment'
          )}
        </button>
      </form>
    </div>
  );
}
