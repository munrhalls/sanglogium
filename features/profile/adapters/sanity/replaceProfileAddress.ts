import "server-only";
import { backendClient } from "@/platform/db/backendClient";
import type { Address } from "@/features/address";

// addressKey must already be validated by the caller (isValidAddressKey in the account slice addressInput rules).
export async function replaceProfileAddress(
  profileId: string,
  addressKey: string,
  address: { _key: string } & Address,
): Promise<void> {
  await backendClient
    .patch(profileId)
    .unset([`addresses[_key=="${addressKey}"]`])
    .append("addresses", [address])
    .commit();
}
