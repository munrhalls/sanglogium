import "server-only";
import { backendClient } from "@/platform/db/backendClient";

// addressKey must already be validated by the caller (isValidAddressKey in features/account/core/rules/addressInput.ts).
export async function removeProfileAddress(
  profileId: string,
  addressKey: string,
): Promise<void> {
  await backendClient
    .patch(profileId)
    .unset([`addresses[_key=="${addressKey}"]`])
    .commit();
}
