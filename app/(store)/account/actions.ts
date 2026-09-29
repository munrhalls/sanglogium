"use server";

import { requireSession } from "@/lib/auth/dal";
import { auth } from "@/lib/auth";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import { getProfileIdByAuthId } from "@/sanity-cms/lib/account/getProfileIdByAuthId";
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
    await backendClient.patch(profile._id).set({ name }).commit();
  }

  return { success: true, name };
}

export async function updatePreferences(formData: FormData) {
  const session = await requireSession();
  const marketingEmailsOptIn = formData.get("marketingEmailsOptIn") === "on";

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await backendClient
    .patch(profile._id)
    .set({ marketingEmailsOptIn })
    .commit();

  return { success: true, marketingEmailsOptIn };
}
