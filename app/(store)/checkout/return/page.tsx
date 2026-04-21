"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "@phosphor-icons/react";
import { useBasketStore } from "@/store/store";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  customerEmail?: string;
  amountTotal: number;
  items: OrderItem[];
}

function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearBasket = useBasketStore((s) => s.clearBasket);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clearBasket();

    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    fetch(`/api/order?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load order");
        setLoading(false);
      });
  }, [clearBasket, sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || "Order not found"}</p>
          <Link href="/" className="mt-4 text-blue-600 hover:underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="mb-4 text-center text-3xl font-bold text-gray-900">
            Payment Successful!
          </h1>
          <p className="mb-8 text-center text-lg text-gray-600">
            Thank you for your order. We&apos;ve received your payment and are
            processing your order.
          </p>

          {/* What happens next */}
          <div className="mb-8 rounded-lg border border-gray-200 p-6">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900">
              <Package className="mr-2 h-6 w-6" />
              What happens next?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                  1
                </span>
                <span>
                  You&apos;ll receive an order confirmation email shortly
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                  2
                </span>
                <span>
                  We&apos;ll process and pack your order within 1-2 business
                  days
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                  3
                </span>
                <span>
                  You&apos;ll receive a shipping notification with tracking
                  details
                </span>
              </li>
            </ul>
          </div>
          {}

          {/* Order Summary */}
          <div className="mb-8 rounded-lg border border-gray-200 p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Order Summary
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${item.total.toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="flex justify-between pt-3 text-lg font-bold">
                <span>Total:</span>
                <span>${order.amountTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/account/orders"
              className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              View My Orders
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/"
              className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-gray-600">
          Need help? Contact us at
          <a
            href="mailto:support@sang-logium.com"
            className="text-blue-600 hover:underline"
          >
            support@sang-logium.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPage />
    </Suspense>
  );
}
