"use server";

import { requireSession } from "@/features/auth/server";
import { getProfileIdByAuthId, setMarketingOptIn } from "@/features/profile/server";

export async function updatePreferencesAction(formData: FormData) {
  const session = await requireSession();
  const marketingEmailsOptIn = formData.get("marketingEmailsOptIn") === "on";

  const profile = await getProfileIdByAuthId(session.userId);
  if (!profile?._id) {
    return { error: "Profile not found." };
  }

  await setMarketingOptIn(profile._id, marketingEmailsOptIn);

  return { success: true, marketingEmailsOptIn };
}
