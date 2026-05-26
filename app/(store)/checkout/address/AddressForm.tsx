"use client";

import { useState } from "react";
import { saveAddress } from "@/app/actions/checkout";
import Loader from "@/app/components/common/Loader";

const REGIONS = [
  { code: "PL", label: "Poland" },
  { code: "GB", label: "United Kingdom" },
] as const;

interface AddressFormProps {
  traceId: string;
}

export default function AddressForm({ traceId }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    regionCode: "",
    postalCode: "",
    street: "",
    streetNumber: "",
    city: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const addressData = {
        regionCode: formData.get("regionCode") as string,
        postalCode: formData.get("postalCode") as string,
        street: formData.get("street") as string,
        streetNumber: formData.get("streetNumber") as string,
        city: formData.get("city") as string,
      };

      // Log address form submission (frontend)
      await fetch('/api/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traceId,
          step: 'address_form_submit',
          data: addressData
        })
      })

      const result = await saveAddress(addressData);
      if (result && result.status === "FIX") {
        setError("Address could not be verified. Please check your details and try again.");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader message="Verifying address..." color="border-t-black" />
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-xl rounded bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Shipping Address</h1>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              name="regionCode"
              value={form.regionCode}
              onChange={(e) => handleChange("regionCode", e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="" disabled>Select country</option>
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              name="city"
              type="text"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Street
              </label>
              <input
                name="street"
                type="text"
                value={form.street}
                onChange={(e) => handleChange("street", e.target.value)}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Number
              </label>
              <input
                name="streetNumber"
                type="text"
                value={form.streetNumber}
                onChange={(e) => handleChange("streetNumber", e.target.value)}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              name="postalCode"
              type="text"
              value={form.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Continue to Shipping
          </button>
        </form>
      </div>
    </div>
  );
}
