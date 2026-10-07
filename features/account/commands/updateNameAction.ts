"use server";

import { requireSession, updateUserName } from "@/features/auth/server";
import { getProfileIdByAuthId, setProfileName } from "@/features/profile/server";

export async function updateNameAction(formData: FormData) {
  const session = await requireSession();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name cannot be empty." };

  await updateUserName(name);

  const profile = await getProfileIdByAuthId(session.userId);
  if (profile?._id) {
    await setProfileName(profile._id, name);
  }

  return { success: true, name };
}
