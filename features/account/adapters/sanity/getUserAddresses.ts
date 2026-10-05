import "server-only";
import { backendClient } from "@/platform/db/backendClient";
import type { UserAddressesProfile } from "@/features/account/core/rules/accountTypes";

export async function getUserAddresses(authId: string): Promise<UserAddressesProfile | null> {
  return backendClient.fetch<UserAddressesProfile | null>(
    `*[_type == "userProfile" && authId == $authId][0]{
      _id,
      addresses
    }`,
    { authId }
  );
}
