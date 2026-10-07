import "server-only";
import { backendClient } from "@/platform/db/backendClient";

export async function setProfileName(
  profileId: string,
  name: string,
): Promise<void> {
  await backendClient.patch(profileId).set({ name }).commit();
}
