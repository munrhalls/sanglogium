"use server";

import { requireSession, getProfileIdByAuthId } from "@/features/auth/server";
import { setMarketingOptIn } from "@/features/account/server";

export async function updatePreferences(formData: FormData) {
  const session = await requireSession();
  const marketingEmailsOptIn = formData.get("marketingEmailsOptIn") === "on";

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await setMarketingOptIn(profile._id, marketingEmailsOptIn);

  return { success: true, marketingEmailsOptIn };
}
