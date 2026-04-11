'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddressForm from '@/components/checkout/AddressForm';
import { useBasketStore } from '@/store/store';

interface AddressFormClientProps {
  sessionId: string;
  idempotencyKey: string;
}

export default function AddressFormClient({ sessionId, idempotencyKey }: AddressFormClientProps) {
  const router = useRouter();
  const basket = useBasketStore((s) => s.basket);
  const [isLoading, setIsLoading] = useState(true);

  // Prepare basket data for address form - filter out items without stripePriceId
  const basketData = basket
    .filter(item => item.stripePriceId) // Only include items with stripePriceId
    .map(item => ({
      _id: item._id,
      quantity: item.quantity,
      stripePriceId: item.stripePriceId!
    }));

  useEffect(() => {
    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
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
    <AddressForm
      sessionId={sessionId}
      idempotencyKey={idempotencyKey}
      basketData={basketData}
    />
  );
}
