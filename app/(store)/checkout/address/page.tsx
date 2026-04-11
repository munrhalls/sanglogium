import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import AddressFormClient from './AddressFormClient';
import Loader from '@/app/components/common/Loader';

interface AddressPageProps {
  searchParams: {
    sessionId?: string;
    idempotencyKey?: string;
  };
}

export default function AddressPage({ searchParams }: AddressPageProps) {
  // Get parameters from URL
  const sessionId = searchParams.sessionId;
  const idempotencyKey = searchParams.idempotencyKey;

  // Validate required parameters
  if (!sessionId || !idempotencyKey) {
    redirect('/basket');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loader />}>
        <AddressFormClient
          sessionId={sessionId}
          idempotencyKey={idempotencyKey}
        />
      </Suspense>
    </div>
  );
}
