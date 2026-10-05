"use server";

import { requireSession, getProfileIdByAuthId } from "@/features/auth/server";
import { isValidAddressKey } from "@/features/account/core/rules/addressInput";
import { removeProfileAddress } from "@/features/account/server";

export async function removeAddress(addressKey: string) {
  const session = await requireSession();
  if (!isValidAddressKey(addressKey)) return { error: "Invalid address." };

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await removeProfileAddress(profile._id, addressKey);

  return { success: true };
}
