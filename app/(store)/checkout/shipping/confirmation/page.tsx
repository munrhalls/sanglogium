"use client";
import Link from "next/link";
import { useCheckout } from "@/app/(store)/checkout/layout";
import { redirect } from "next/navigation";
import DisplayAddress from "./DisplayAddress";
import { Check, X, PencilSimple } from "@phosphor-icons/react";

export default function Page() {
  const { shippingAPIValidation, shippingAddress } = useCheckout();
  if (shippingAPIValidation?.status == null || shippingAddress == null) {
    redirect("/checkout/shipping");
  }

  const status = shippingAPIValidation.status;
  // startstart
  return (
    <div className="flex flex-col gap-4">
      {/* Address Card - Condensed */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md">
        <DisplayAddress shippingAddress={shippingAddress} />
      </div>

      {status === "CONFIRMED" ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <Check className="text-green-600" size={18} />
          <p className="text-sm font-semibold text-green-800">
            Address confirmed on map
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            Address partially confirmed on the map. Are you sure it's
            correct?{" "}
          </p>
          <Link
            href="/checkout/shipping"
            className="inline-flex items-center gap-1 text-sm font-semibold text-yellow-900 hover:text-yellow-950"
          >
            <PencilSimple size={16} />
            Edit
          </Link>
        </div>
      )}

      <Link
        href="/checkout/payment"
        className="rounded-lg bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        Proceed to Payment
      </Link>
    </div>
  );
}
