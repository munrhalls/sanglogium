"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

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
      const reservationId = typeof window !== 'undefined' ? window.sessionStorage.getItem('reservationId') : null;
      const res = await fetch("/api/shipping", {
        method: "POST",
        body: JSON.stringify({ ...formData, reservationId }),
      });
      const {
        status: apiAddressStatus,
        correctedAddress: apiCorrectedAddress,
      } = await res.json();

      if (!apiCorrectedAddress) {
        throw new Error("No corrected address returned from API");
      }
      setShippingAPIValidation(apiAddressStatus);
      console.log(apiAddressStatus, "api address status @layout");

      if (apiAddressStatus === "CONFIRMED" || apiAddressStatus === "PARTIAL") {
        const parsedApiCorrectedAddress: ShippingAddress = {
          street: apiCorrectedAddress.street,
          streetNumber: apiCorrectedAddress.streetNumber,
          city: apiCorrectedAddress.city,
          postalCode: apiCorrectedAddress.postalCode,
          regionCode: apiCorrectedAddress.regionCode,
        };

        setShippingAddress(parsedApiCorrectedAddress);
        setIsLoading(false);
        router.push("/checkout/shipping/confirmation");
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error validating shipping address:", error);
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
