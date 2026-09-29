import { backendClient } from "@/sanity-cms/lib/backendClient";

export async function getProfileIdByAuthId(authId: string): Promise<{ _id: string } | null> {
  return backendClient.fetch<{ _id: string } | null>(
    `*[_type == "userProfile" && authId == $authId][0]{_id}`,
    { authId }
  );
}
