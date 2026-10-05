"use server";

import { requireSession, auth, getProfileIdByAuthId } from "@/features/auth/server";
import { headers } from "next/headers";
import { setProfileName } from "@/features/account/server";

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
