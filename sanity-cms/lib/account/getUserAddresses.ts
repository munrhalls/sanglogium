import { backendClient } from "@/sanity-cms/lib/backendClient";
import type { Address } from "@/app/checkout/checkout.types";

export type SavedAddress = Address & { _key: string };

export interface UserAddressesProfile {
  _id: string;
  addresses?: SavedAddress[];
}

export async function getUserAddresses(authId: string): Promise<UserAddressesProfile | null> {
  return backendClient.fetch<UserAddressesProfile | null>(
    `*[_type == "userProfile" && authId == $authId][0]{
      _id,
      addresses
    }`,
    { authId }
  );
}
