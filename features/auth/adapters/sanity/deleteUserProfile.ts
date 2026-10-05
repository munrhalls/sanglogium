import "server-only";
import { backendClient } from "@/platform/db/backendClient";
import { getProfileIdByAuthId } from "./getProfileIdByAuthId";

export async function deleteUserProfile(authId: string): Promise<void> {
  const profile = await getProfileIdByAuthId(authId);

  if (profile?._id) {
    await backendClient.delete(profile._id);
  }
}
