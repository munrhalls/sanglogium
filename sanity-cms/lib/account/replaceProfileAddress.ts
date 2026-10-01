import { backendClient } from "@/sanity-cms/lib/backendClient";
import type { Address } from "@/features/checkout";

// addressKey must already be validated by the caller (isValidAddressKey in features/account/actions.ts).
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
