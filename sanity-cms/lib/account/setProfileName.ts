import { backendClient } from "@/sanity-cms/lib/backendClient";

export async function setProfileName(
  profileId: string,
  name: string,
): Promise<void> {
  await backendClient.patch(profileId).set({ name }).commit();
}
