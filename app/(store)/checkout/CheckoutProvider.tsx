"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Address, Status } from "./checkout.types";
import { submitShippingAction } from "@/app/actions/address/address";

type CheckoutContextType = {
  status: Status;
  address: Address | null;
  apiErrors: Record<string, string>;
  submitAddress: (data: Address) => Promise<void>;
  editAddress: () => void;
};

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export default function CheckoutProvider({
  children,
  initialAddress,
  initialStatus,
}: {
  children: ReactNode;
  initialAddress: Address | null;
  initialStatus: Status | null;
}) {
  const [status, setStatus] = useState<Status>(initialStatus || "EDITING");
  const [address, setAddress] = useState<Address | null>(initialAddress);
  const [apiErrors, setAPIErrors] = useState<Record<string, string>>({});

  const submitAddress = async (data: Address) => {
    setStatus("LOADING");
    setAPIErrors({});

    try {
      const response = await submitShippingAction(data);
      const responseStatus = response.status;
      const responseAddress = response.address;

      console.log("Submit Address Response:", response);

      if (responseStatus === "ACCEPT" && responseAddress) {
        setAddress(responseAddress);
        setStatus("ACCEPT");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("FIX");
      setAPIErrors({ form: "Something went wrong. Please try again." });
    }
  };

  const editAddress = () => {
    setStatus("EDITING");
    setAPIErrors({});
  };

  return (
    <CheckoutContext.Provider
      value={{ status, address, apiErrors, submitAddress, editAddress }}
    >
      {process.env.NODE_ENV === "development"}
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}
