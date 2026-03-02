import Link from "next/link";
import { getOrderBySession } from "@/app/actions/checkout/getOrderBySession";
import { OrderSuccessClient } from "./components/OrderSuccessClient";
import { SuccessMessage } from "./components/SuccessMessage";
import { WhatHappensNext } from "./components/WhatHappensNext";
import { OrderSummary } from "./components/OrderSummary";
import { ActionButtons } from "./components/ActionButtons";

interface PageProps {
  searchParams: { session_id?: string };
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const sessionId = searchParams.session_id ?? null;
  const order = await getOrderBySession(sessionId);

  if (!sessionId || !order) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Order not found</p>
          <Link href="/" className="mt-4 text-blue-600 hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <OrderSuccessClient>
      <div className="min-h-dvh bg-gradient-to-b from-green-50 to-white py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <SuccessMessage />
            <WhatHappensNext />
            <OrderSummary order={order} />
            <ActionButtons />
          </div>
          <p className="mt-8 text-center text-sm text-gray-600">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@sang-logium.com"
              className="text-blue-600 hover:underline"
            >
              support@sang-logium.com
            </a>
          </p>
        </div>
      </div>
    </OrderSuccessClient>
  );
}
