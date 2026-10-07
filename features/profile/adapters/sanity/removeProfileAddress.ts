import "server-only";
import { backendClient } from "@/platform/db/backendClient";

// addressKey must already be validated by the caller (isValidAddressKey in the account slice addressInput rules).
export async function removeProfileAddress(
  profileId: string,
  addressKey: string,
): Promise<void> {
  await backendClient
    .patch(profileId)
    .unset([`addresses[_key=="${addressKey}"]`])
    .commit();
}
