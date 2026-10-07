"use server";

import { requireSession } from "@/features/auth/server";
import { getProfileIdByAuthId, addProfileAddress } from "@/features/profile/server";
import { randomUUID } from "node:crypto";
import { parseAddress } from "@/features/account/core/rules/addressInput";

export async function addAddress(formData: FormData) {
  const session = await requireSession();
  const parsed = parseAddress(formData);
  if ("error" in parsed) return parsed;

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  const newAddress = { _key: randomUUID(), ...parsed };

  await addProfileAddress(profile._id, newAddress);

  return { success: true };
}
