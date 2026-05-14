"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/common/Loader";
import OrderSummary from "./_components/OrderSummary";
import PaymentForm from "./_components/PaymentForm";

type Status = "loading" | "ready" | "error";

export default function PaymentPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("usd");
  const [error, setError] = useState<string | null>(null);
  const [basketReservationId, setBasketReservationId] = useState<string | null>(null);

  useEffect(() => {
    async function initializePayment() {
      try {
        // Step 1: Get basketReservationId from sessionStorage
        const id = sessionStorage.getItem("basketReservationId");
        if (!id) {
          router.push("/basket");
          return;
        }

        setBasketReservationId(id);

        // Step 2: Call POST /api/checkout/payment-intent
        const response = await fetch("/api/checkout/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ basketReservationId: id }),
        });

        if (!response.ok) {
          throw new Error("Failed to initialize payment");
        }

        const data = await response.json();
        
        // Step 3: Calculate total from reservation for display
        const reservationResponse = await fetch(`/api/basket-reservations/${id}`);
        if (!reservationResponse.ok) {
          throw new Error("Failed to fetch reservation");
        }
        const reservation = await reservationResponse.json();
        
        const itemsTotal = reservation.basketReservation.reduce(
          (sum: number, item: any) => sum + item.verifiedPrice * item.quantity,
          0
        );
        const shippingTotal = reservation.shippingChoice.amount;
        const total = itemsTotal + shippingTotal;
        
        setClientSecret(data.clientSecret);
        setTotalAmount(total);
        setCurrency(reservation.shippingChoice.currency);
        setStatus("ready");
      } catch (err) {
        console.error("Error initializing payment:", err);
        setError("Unable to prepare payment. Please try again.");
        setStatus("error");
      }
    }

    initializePayment();
  }, [router]);

  const handleRetry = () => {
    setStatus("loading");
    setError(null);
    // Re-trigger the effect by clearing and resetting
    window.location.reload();
  };

  const handleGoBack = () => {
    router.push("/checkout/shipping");
  };

  if (status === "loading") {
    return <Loader message="Preparing payment..." />;
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-red-800">Payment Error</h2>
        <p className="mb-6 text-red-600">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={handleRetry}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={handleGoBack}
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (status === "ready" && basketReservationId && clientSecret) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <OrderSummary basketReservationId={basketReservationId} />
        </div>
        <div>
          <PaymentForm
            clientSecret={clientSecret}
            totalAmount={totalAmount}
            currency={currency}
          />
        </div>
      </div>
    );
  }

  return null;
}
