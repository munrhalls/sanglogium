"use server";

import { requireSession, getProfileIdByAuthId } from "@/features/auth/server";
import { isValidAddressKey, parseAddress } from "@/features/account/core/rules/addressInput";
import { replaceProfileAddress } from "@/features/account/server";

export async function updateAddress(addressKey: string, formData: FormData) {
  const session = await requireSession();
  if (!isValidAddressKey(addressKey)) return { error: "Invalid address." };

  const parsed = parseAddress(formData);
  if ("error" in parsed) return parsed;

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  const updatedAddress = { _key: addressKey, ...parsed };

  await replaceProfileAddress(profile._id, addressKey, updatedAddress);

  return { success: true };
}
