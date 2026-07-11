"use server";

import { requireSession } from "@/lib/auth/dal";
import { auth } from "@/lib/auth";
import { backendClient } from "@/sanity-cms/lib/backendClient";
import { headers } from "next/headers";

export async function updateName(formData: FormData) {
  const session = await requireSession();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name cannot be empty." };

  await auth.api.updateUser({
    headers: await headers(),
    body: { name },
  });

  const profile = await backendClient.fetch(
    `*[_type == "userProfile" && authId == $authId][0]{_id}`,
    { authId: session.userId }
  );
  if (profile?._id) {
    await backendClient.patch(profile._id).set({ name }).commit();
  }

  return { success: true, name };
}

export async function updatePreferences(formData: FormData) {
  const session = await requireSession();
  const marketingEmailsOptIn = formData.get("marketingEmailsOptIn") === "on";

  const profile = await backendClient.fetch(
    `*[_type == "userProfile" && authId == $authId][0]{_id}`,
    { authId: session.userId }
  );
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await backendClient
    .patch(profile._id)
    .set({ marketingEmailsOptIn })
    .commit();

  return { success: true, marketingEmailsOptIn };
}
