"use client";
import { useForm } from "react-hook-form";
import { X } from "@phosphor-icons/react";
import Loader from "@/app/components/common/Loader";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/app/(store)/checkout/layout";
import CheckoutContextType from "@/app/(store)/checkout/layout";

type FormData = {
  regionCode: string;
  postalCode: string;
  street: string;
  streetNumber: number;
  city: string;
};

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({ mode: "onBlur" });
  const router = useRouter();
  const { validateShipping, isLoading, shippingAPIValidation } = useCheckout();

  const handleAddressSubmit = (data: FormData) => {
    validateShipping(data);
  };

  // TODO handle API error state in the UI
  // TODO prevent DDOS etc. by disabling submit button while loading and by limiting amount submits per minute / hour / day
  return (
    <div className="flex min-h-screen justify-center">
      <div className="relative rounded bg-white p-4">
        {!isLoading && (
          <button
            onClick={() => router.back()}
            className="absolute right-3 top-3 z-50 rounded px-4 py-2 text-black"
          >
            <X size={24} />
          </button>
        )}
        <div className="relative min-h-96 w-80">
          {!isLoading && (
            <form onSubmit={handleSubmit(handleAddressSubmit)}>
              <h2 className="mb-4 text-lg font-bold">Enter Shipping Address</h2>
              <p className="text-sm font-black tracking-wide">Country</p>
              <select
                {...register("regionCode", { required: true })}
                className="mb-4 w-full border border-gray-300 p-2"
              >
                <option value="PL">Poland</option>
                <option value="EN">England</option>
              </select>
              <p className="text-sm font-black tracking-wide">Postal code</p>
              <input
                {...register("postalCode", { required: true })}
                type="text"
                placeholder="Postal Code"
                className="mb-2 w-full border border-gray-300 p-2"
              />
              <div className="grid grid-cols-8 gap-2">
                <div className="col-span-6">
                  <p className="text-sm font-black tracking-wide">Street</p>
                  <input
                    {...register("street", { required: true })}
                    type="text"
                    placeholder="Street"
                    className="mb-2 w-full border border-gray-300 p-2"
                  />
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-black tracking-wide">Number</p>
                  <input
                    {...register("streetNumber", { required: true })}
                    type="number"
                    placeholder="..."
                    className="mb-2 flex w-full items-center justify-center border border-gray-300 p-2"
                  />
                </div>
              </div>
              <p className="text-sm font-black tracking-wide">City</p>
              <input
                {...register("city", { required: true })}
                type="text"
                placeholder="City"
                className="mb-2 w-full border border-gray-300 p-2"
              />
              <button
                disabled={!isValid}
                type="submit"
                className={`w-full rounded px-4 py-2 ${
                  !isValid
                    ? "cursor-not-allowed bg-gray-400 text-gray-600"
                    : "bg-black text-white"
                }`}
              >
                Submit Address
              </button>
            </form>
          )}
          {shippingAPIValidation === "FIX" && (
            <p className="mt-4 text-sm text-red-600">
              Could not locate provided address on the map. Please review and
              make sure it is correct.
            </p>
          )}
          {isLoading && (
            <Loader message="Processing..." color="border-t-black" />
          )}
        </div>
      </div>
    </div>
  );
}
