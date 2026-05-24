"use client";
import { useState } from "react";
import { saveShippingAction } from "@/app/actions/checkout";
import { formatPolishPrice, formatDeliveryEstimate } from "@/lib/utils/formatting";

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

interface ShippingPageClientProps {
  shippingOptions: ShippingOption[];
}

export default function ShippingPageClient({ shippingOptions }: ShippingPageClientProps) {
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectOption = (option: ShippingOption) => {
    setSelectedOption(option);
  };

  const handleContinue = async () => {
    if (!selectedOption) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await saveShippingAction(selectedOption.rateId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się zapisać wyboru dostawy");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (shippingOptions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded bg-white p-6 shadow">
          <p className="text-black">Brak dostępnych opcji dostawy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full max-w-2xl rounded bg-slate-500 p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Wybierz metodę dostawy</h1>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {shippingOptions.map((option) => (
            <div
              key={option.rateId}
              onClick={() => handleSelectOption(option)}
              className={`cursor-pointer rounded border-2 p-4 transition-colors ${
                selectedOption?.rateId === option.rateId
                  ? "border-black bg-gray-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{option.provider}</p>
                  <p className="text-sm text-black">{option.servicelevel.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPolishPrice(option.amount)}</p>
                  <p className="text-sm text-black">{formatDeliveryEstimate(option.estimatedDays)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedOption || isSubmitting}
          className={`mt-6 w-full rounded px-4 py-3 font-semibold ${
            !selectedOption || isSubmitting
              ? "cursor-not-allowed bg-gray-400 text-black"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isSubmitting ? "Przetwarzanie..." : "Przejdź do płatności"}
        </button>
      </div>
    </div>
  );
}
