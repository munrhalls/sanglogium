"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { submitShippingAction } from "@/app/actions/address/address";

export type ShippingAddress = {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  city: string;
};

export type CheckoutContextType = {
  shippingAPIValidation: string | null;
  setShippingAPIValidation: (status: string | null) => void;
  validateShipping: (formData: ShippingAddress) => Promise<void>;
  isLoading: boolean;
  shippingAddress: ShippingAddress | null;
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function useCheckout() {
  return useContext(CheckoutContext);
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shippingAPIValidation, setShippingAPIValidation] = useState<
    string | null
  >(null);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateShipping = async (formData: ShippingAddress) => {
    setIsLoading(true);
    try {
      // Step 1: Call server action for Google validation
      const validation = await submitShippingAction(formData);

      if (validation.status === "FIX" || !validation.address) {
        setShippingAPIValidation("FIX");
        setIsLoading(false);
        return;
      }

      // Step 2: On ACCEPT, call PATCH endpoint to save address
      const basketReservationId = typeof window !== 'undefined' ? window.sessionStorage.getItem('basketReservationId') : null;
      if (!basketReservationId) {
        throw new Error("No basket reservation ID found in session storage");
      }

      const patchRes = await fetch(`/api/basket-reservations/${basketReservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress: validation.address }),
      });

      if (!patchRes.ok) {
        throw new Error("Failed to save shipping address");
      }

      // Experiment 1: Save to sessionStorage for optimization
      sessionStorage.setItem("shippingAddress", JSON.stringify(validation.address));
      console.log("[ADDRESS SLICE] Saved shippingAddress to sessionStorage:", validation.address);

      // Step 3: On success, set state and redirect
      setShippingAPIValidation("CONFIRMED");
      setShippingAddress(validation.address);
      setIsLoading(false);
      router.push("/checkout/shipping");
    } catch (error) {
      console.error("Error validating shipping address:", error);
      setShippingAPIValidation("FIX");
      setIsLoading(false);
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        shippingAPIValidation,
        setShippingAPIValidation,
        validateShipping,
        isLoading,
        shippingAddress,
      }}
    >
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-8 flex justify-center text-3xl font-black uppercase">
          Checkout
        </h1>
        {children}
      </div>
    </CheckoutContext.Provider>
  );
}
