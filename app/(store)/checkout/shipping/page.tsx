"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/common/Loader";

interface ShippingOption {
  provider: string;
  servicelevel: {
    name: string;
  };
  rateId: string;
  amount: number;
  currency: string;
  estimatedDays: number;
}

interface ShippingChoice {
  provider: string;
  serviceLevel: string;
  rateId: string;
  amount: number;
  currency: string;
  estimatedDays: number;
}

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorClass, setErrorClass] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchShippingOptions = async () => {
      try {
        const basketReservationId = sessionStorage.getItem("basketReservationId");

        if (!basketReservationId) {
          router.push("/basket");
          return;
        }

        const response = await fetch(
          `/api/shipping/rates?basketReservationId=${basketReservationId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error === "Shipping address not found in reservation") {
            router.push("/checkout/address");
            return;
          }
          setError(errorData.error || "Failed to fetch shipping rates");
          setErrorClass(errorData.errorClass || null);
          setRetryable(errorData.retryable || false);
          return;
        }

        const data = await response.json();
        setShippingOptions(data.options || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shipping options");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingOptions();
  }, [router]);

  const handleSelectOption = (option: ShippingOption) => {
    setSelectedOption(option);
  };

  const handleRetry = () => {
    setError(null);
    setErrorClass(null);
    setRetryable(false);
    setIsLoading(true);
    // Trigger re-fetch by re-running the useEffect
    window.location.reload();
  };

  const handleContinue = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    try {
      const basketReservationId = sessionStorage.getItem("basketReservationId");
      if (!basketReservationId) {
        router.push("/basket");
        return;
      }

      const shippingChoice: ShippingChoice = {
        provider: selectedOption.provider,
        serviceLevel: selectedOption.servicelevel.name,
        rateId: selectedOption.rateId,
        amount: selectedOption.amount,
        currency: selectedOption.currency,
        estimatedDays: selectedOption.estimatedDays,
      };

      const response = await fetch(`/api/basket-reservations/${basketReservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shippingChoice }),
      });

      if (!response.ok) {
        throw new Error("Failed to save shipping choice");
      }

      router.push("/checkout/payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save shipping choice");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader message="Loading shipping options..." color="border-t-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded bg-white p-6 shadow">
          <p className="text-red-600">{error}</p>
          <div className="mt-4 flex gap-2">
            {retryable && (
              <button
                onClick={handleRetry}
                className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="rounded border border-black px-4 py-2 text-black hover:bg-gray-100"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full max-w-2xl rounded bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Select Shipping Method</h1>

        {shippingOptions.length === 0 ? (
          <p className="text-gray-600">No shipping options available.</p>
        ) : (
          <div className="space-y-4">
            {shippingOptions.map((option) => (
              <div
                key={option.rateId}
                onClick={() => handleSelectOption(option)}
                className={`cursor-pointer rounded border p-4 transition-colors ${
                  selectedOption?.rateId === option.rateId
                    ? "border-black bg-gray-50"
                    : "border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{option.provider}</p>
                    <p className="text-sm text-gray-600">{option.servicelevel.name}</p>
                    <p className="text-sm text-gray-500">
                      Estimated delivery: {option.estimatedDays} days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {(option.amount / 100).toFixed(2)} {option.currency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selectedOption || isSubmitting}
          className={`mt-6 w-full rounded px-4 py-3 font-semibold ${
            !selectedOption || isSubmitting
              ? "cursor-not-allowed bg-gray-400 text-gray-600"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isSubmitting ? "Processing..." : "Continue to Payment"}
        </button>
      </div>
    </div>
  );
}
