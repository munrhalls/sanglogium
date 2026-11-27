import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";

export async function deleteUserProfile(authId: string): Promise<void> {
  await backendClient.delete({
    query: '*[_type == "userProfile" && authId == $authId]',
    params: { authId },
  });
}
