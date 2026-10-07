import "server-only";
import { backendClient } from "@/platform/db/backendClient";

export async function getProfileIdByAuthId(authId: string): Promise<{ _id: string } | null> {
  return backendClient.fetch<{ _id: string } | null>(
    `*[_type == "userProfile" && authId == $authId][0]{_id}`,
    { authId }
  );
}
