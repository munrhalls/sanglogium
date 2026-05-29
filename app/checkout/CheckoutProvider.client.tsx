"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { submitShippingAction } from "@/app/actions/address/address";

export type ShippingAddress = {
  firstName: string;
  lastName: string;
  phone: string;
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

export default function CheckoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [shippingAPIValidation, setShippingAPIValidation] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateShipping = async (formData: ShippingAddress) => {
    setIsLoading(true);
    try {
      const validation = await submitShippingAction(formData);

      if (validation.status === "FIX" || !validation.address) {
        setShippingAPIValidation("FIX");
        setIsLoading(false);
        return;
      }

      const basketReservationId =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("basketReservationId")
          : null;
      if (!basketReservationId) {
        throw new Error("No basket reservation ID found in session storage");
      }

      const patchRes = await fetch(
        `/api/basket-reservations/${basketReservationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shippingAddress: validation.address }),
        }
      );

      if (!patchRes.ok) {
        throw new Error("Failed to save shipping address");
      }

      sessionStorage.setItem(
        "shippingAddress",
        JSON.stringify(validation.address)
      );
      console.log(
        "[ADDRESS SLICE] Saved shippingAddress to sessionStorage:",
        validation.address
      );

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
      {children}
    </CheckoutContext.Provider>
  );
}
