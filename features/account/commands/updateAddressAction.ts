"use server";

import { requireSession } from "@/features/auth/server";
import { getProfileIdByAuthId, replaceProfileAddress } from "@/features/profile/server";
import { isValidAddressKey, parseAddress } from "@/features/account/core/rules/addressInput";

export async function updateAddressAction(addressKey: string, formData: FormData) {
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
