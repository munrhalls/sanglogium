'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AddressForm from '@/components/checkout/AddressForm';
import { useBasketStore } from '@/store/store';

export default function AddressPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const basket = useBasketStore((s) => s.basket);

  const [sessionId, setSessionId] = useState<string>('');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  useEffect(() => {
    // Get parameters from URL
    const sessionIdParam = searchParams.get('sessionId');
    const idempotencyKeyParam = searchParams.get('idempotencyKey');

    if (!sessionIdParam || !idempotencyKeyParam) {
      // Missing required parameters, redirect to basket
      router.push('/basket');
      return;
    }

    setSessionId(sessionIdParam);
    setIdempotencyKey(idempotencyKeyParam);
  }, [searchParams, router]);

  // Prepare basket data for address form - filter out items without stripePriceId
  const basketData = basket
    .filter(item => item.stripePriceId) // Only include items with stripePriceId
    .map(item => ({
      _id: item._id,
      quantity: item.quantity,
      stripePriceId: item.stripePriceId!
    }));

  if (!sessionId || !idempotencyKey) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to basket if empty
  if (basketData.length === 0) {
    router.push('/basket');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AddressForm
        sessionId={sessionId}
        idempotencyKey={idempotencyKey}
        basketData={basketData}
      />
    </div>
  );
}
