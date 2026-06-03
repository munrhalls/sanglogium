"use client";

import { useState, useEffect } from "react";
import { saveAddress } from "@/app/actions/checkout";
import Loader from "@/app/components/common/Loader";
import type { Address } from "../checkout.types";

const REGIONS = [
  { code: "PL", label: "Poland" },
  { code: "GB", label: "United Kingdom" },
] as const;

interface AddressFormProps {
  traceId: string;
  initialAddress?: Address;
}

export default function AddressForm({ traceId, initialAddress }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    regionCode: "",
    postalCode: "",
    street: "",
    streetNumber: "",
    city: "",
  });

  // Hydrate form from session address when user returns via Back button
  useEffect(() => {
    console.log("[AddressForm] initialAddress from session:", initialAddress);
    if (initialAddress) {
      setForm({
        firstName: initialAddress.firstName || "",
        lastName: initialAddress.lastName || "",
        phone: initialAddress.phone || "",
        regionCode: initialAddress.regionCode || "",
        postalCode: initialAddress.postalCode || "",
        street: initialAddress.street || "",
        streetNumber: initialAddress.streetNumber || "",
        city: initialAddress.city || "",
      });
    }
  }, [initialAddress]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    const addressData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      regionCode: formData.get("regionCode") as string,
      postalCode: formData.get("postalCode") as string,
      street: formData.get("street") as string,
      streetNumber: formData.get("streetNumber") as string,
      city: formData.get("city") as string,
    };

    // Fire-and-forget trace logging — never block submission on trace failure
    fetch('/api/trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traceId,
        step: 'address_form_submit',
        data: addressData
      })
    }).catch(() => {});

    try {
      const result = await saveAddress(addressData);
      if (result && result.status === "FIX") {
        setError("Address could not be verified. Please check your details and try again.");
        setIsLoading(false);
      }
    } catch (err) {
      // NEVER intercept Next.js redirect errors — let the framework handle navigation
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        throw err;
      }
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
    <div className="max-w-xl mx-auto w-full">
      <h1 className="type-section-hed text-center mb-10">Shipping Address</h1>

      {error && (
        <div className="mb-4 rounded border border-error-500/30 bg-error-500/10 p-3">
          <p className="text-sm text-error-500">{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
          <p className="section-header-anchor type-overline mb-6">Contact Information</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="type-caption mb-1.5 block">
                First Name
              </label>
              <input
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="type-caption mb-1.5 block">
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="type-caption mb-1.5 block">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
              className="input-field"
            />
          </div>

          <p className="section-header-anchor type-overline mb-6 mt-12">Shipping Address</p>

          <div>
            <label className="type-caption mb-1.5 block">
              Country
            </label>
            <select
              name="regionCode"
              value={form.regionCode}
              onChange={(e) => handleChange("regionCode", e.target.value)}
              required
              className="input-select w-full"
            >
              <option value="" disabled>Select country</option>
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="type-caption mb-1.5 block">
              City
            </label>
            <input
              name="city"
              type="text"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div>
              <label className="type-caption mb-1.5 block">
                Street
              </label>
              <input
                name="street"
                type="text"
                value={form.street}
                onChange={(e) => handleChange("street", e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="type-caption mb-1.5 block">
                Number
              </label>
              <input
                name="streetNumber"
                type="text"
                value={form.streetNumber}
                onChange={(e) => handleChange("streetNumber", e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="type-caption mb-1.5 block">
              Postal Code
            </label>
            <input
              name="postalCode"
              type="text"
              value={form.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-cart-large w-full mt-8"
          >
            Continue to Shipping
          </button>
        </form>
    </div>
  );
}
