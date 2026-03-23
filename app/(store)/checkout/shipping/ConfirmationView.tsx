"use client";

import Link from "next/link";
import { useCheckout } from "../CheckoutProvider"; // Import from the new provider
import DisplayAddress from "./DisplayAddress";
import { CheckCircle, PencilSimple } from "@phosphor-icons/react";
import { useEffect } from "react";

export default function ConfirmationView() {
  const { address, status, editAddress } = useCheckout();

  useEffect(() => {
    if (!address) {
      editAddress();
    }
  }, [address, editAddress]);

  if (!address) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md">
        <DisplayAddress address={address} />

        <button
          onClick={editAddress}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-yellow-900 hover:text-yellow-950"
        >
          <PencilSimple size={16} />
          Edit
        </button>
      </div>

      {status === "ACCEPT" ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
          <CheckCircle className="text-green-600" size={18} />
          <p className="text-sm font-semibold text-green-800">
            Address confirmed on map
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-yellow-300 bg-yellow-50 p-3">
          <p className="text-sm text-yellow-800">
            Address partially confirmed on the map. Are you sure it&apos;s
            correct?{" "}
          </p>
        </div>
      )}

      <Link
        data-testid="proceed-to-payment-btn"
        href="/checkout/payment"
        className="rounded-lg bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        Proceed to Payment
      </Link>
    </div>
  );
}
