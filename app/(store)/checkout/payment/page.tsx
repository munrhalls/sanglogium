import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getGuestSession } from '@/app/actions/checkout/reserveStock';
import PaymentFormClient from './PaymentFormClient';
import Loader from '@/app/components/common/Loader';

interface PaymentPageProps {
  searchParams: {
    sessionId?: string;
  };
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  // Get sessionId from URL
  const sessionId = searchParams.sessionId;

  if (!sessionId) {
    redirect('/basket');
  }

  // Get guest session data server-side
  const guestSession = await getGuestSession(sessionId);

  if (!guestSession || !guestSession.paymentIntentId || !guestSession.reservationId) {
    redirect('/basket');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Loader />}>
        <PaymentFormClient
          clientSecret={guestSession.clientSecret}
          reservationId={guestSession.reservationId}
          expiresAt={guestSession.expiresAt}
          amountPln={guestSession.amountPln || 0}
        />
      </Suspense>
    </div>
  );
}
