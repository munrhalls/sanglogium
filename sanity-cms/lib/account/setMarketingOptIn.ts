import { backendClient } from "@/sanity-cms/lib/backendClient";

export async function setMarketingOptIn(
  profileId: string,
  marketingEmailsOptIn: boolean,
): Promise<void> {
  await backendClient
    .patch(profileId)
    .set({ marketingEmailsOptIn })
    .commit();
}
