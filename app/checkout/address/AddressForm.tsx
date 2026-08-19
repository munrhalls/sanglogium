"use client";

import { useState, useEffect, useRef } from "react";
import { unstable_rethrow } from "next/navigation";
import { saveAddress } from "@/app/actions/checkout";
import CheckoutStepper from "../_components/CheckoutStepper";
import type { Address } from "../checkout.types";

const REGIONS = [{ code: "PL", label: "Poland" }] as const;

interface AddressFormProps {
  traceId: string;
  initialAddress?: Address;
}

export default function AddressForm({
  traceId,
  initialAddress,
}: AddressFormProps) {
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

  const isDirty = useRef(false);
  // Set by the "Continue with entered address" escape-hatch button before it
  // submits, so the next handleSubmit call bypasses Google validation.
  const skipValidationRef = useRef(false);

  // Hydrate form from session address when user returns via Back button.
  // regionCode is sanitized against REGIONS so a stale/legacy session address
  // can never leave the country select in an unmatched (broken) state, and the
  // dirty-guard prevents re-hydration from clobbering edits in the current visit.
  useEffect(() => {
    if (!initialAddress || isDirty.current) return;
    setForm({
      firstName: initialAddress.firstName || "",
      lastName: initialAddress.lastName || "",
      phone: initialAddress.phone || "",
      regionCode: REGIONS.some((r) => r.code === initialAddress.regionCode)
        ? initialAddress.regionCode
        : "",
      postalCode: initialAddress.postalCode || "",
      street: initialAddress.street || "",
      streetNumber: initialAddress.streetNumber || "",
      city: initialAddress.city || "",
    });
  }, [initialAddress]);

  const handleChange = (field: keyof typeof form, value: string) => {
    isDirty.current = true;
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (formData: FormData, skip = false) => {
    setIsLoading(true);
    setError(null);

    // The escape-hatch button resubmits with skip=true so a valid address can
    // never dead-end on a strict Google validation verdict.
    const skipValidation =
      skip ||
      skipValidationRef.current ||
      formData.get("submitMode") === "skipValidation";
    skipValidationRef.current = false;

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

    // CLICK TRACE — log exactly what happens when the user clicks the submit button
    console.log("[ADDRESS FORM] Continue to Shipping clicked", {
      traceId,
      skipValidation,
      addressData,
      initialAddressInSession: initialAddress,
    });

    // Fire-and-forget trace logging — never block submission on trace failure
    fetch("/api/trace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        traceId,
        step: "address_form_submit",
        data: addressData,
      }),
    }).catch(() => {});

    try {
      const result = await saveAddress(addressData, { skipValidation });
      console.log("[ADDRESS FORM] saveAddress resolved", result);
      if (result && result.status === "FIX") {
        console.log(
          "[ADDRESS FORM] Address REJECTED by validation",
          result.errors,
        );
        setError(
          result.errors?.message ??
            "Address could not be verified. Please check your details and try again.",
        );
      }
    } catch (err) {
      // NEVER intercept Next.js redirect errors — let the framework handle navigation
      console.log("[ADDRESS FORM] saveAddress threw", err);
      unstable_rethrow(err);
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <CheckoutStepper currentStep={1} />
      <h1 className="type-section-hed mb-10 text-center">Shipping Address</h1>

      {error && (
        <div className="rounded mb-4 border border-error-500/30 bg-error-500/10 p-3">
          <p className="text-sm text-error-500">{error}</p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <p className="type-overline section-header-anchor mb-6">
          Contact Information
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="type-caption mb-1.5 block">First Name</label>
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
            <label className="type-caption mb-1.5 block">Last Name</label>
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
          <label className="type-caption mb-1.5 block">Phone Number</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
            className="input-field"
          />
        </div>

        <p className="type-overline section-header-anchor mb-6 mt-12">
          Shipping Address
        </p>

        <div>
          <label className="type-caption mb-1.5 block">Country</label>
          <select
            name="regionCode"
            value={form.regionCode}
            onChange={(e) => handleChange("regionCode", e.target.value)}
            required
            className="input-select w-full"
          >
            <option value="" disabled>
              Select country
            </option>
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="type-caption mb-1.5 block">City</label>
          <input
            name="city"
            type="text"
            value={form.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
          <div>
            <label className="type-caption mb-1.5 block">Street</label>
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
            <label className="type-caption mb-1.5 block">Number</label>
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
          <label className="type-caption mb-1.5 block">Postal Code</label>
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
          className="btn-cart-large mt-8 w-full"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="rounded-full inline-block h-4 w-4 animate-spin border-2 border-brand-700/40 border-t-brand-700" />
              Verifying...
            </span>
          ) : (
            "Continue to Shipping"
          )}
        </button>

        {error && !isLoading && (
          <button
            type="submit"
            onClick={() => {
              skipValidationRef.current = true;
            }}
            className="btn-secondary mt-3 w-full py-3"
          >
            Continue with entered address
          </button>
        )}
      </form>
    </div>
  );
}
