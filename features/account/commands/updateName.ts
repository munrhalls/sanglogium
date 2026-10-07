"use server";

import { requireSession, auth } from "@/features/auth/server";
import { getProfileIdByAuthId, setProfileName } from "@/features/profile/server";
import { headers } from "next/headers";

export async function updateName(formData: FormData) {
  const session = await requireSession();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name cannot be empty." };

  await auth.api.updateUser({
    headers: await headers(),
    body: { name },
  });

  const profile = await getProfileIdByAuthId(session.userId);
  if (profile?._id) {
    await setProfileName(profile._id, name);
  }

  return { success: true, name };
}
