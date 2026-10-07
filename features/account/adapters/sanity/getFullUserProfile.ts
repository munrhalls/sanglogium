import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";

export async function getFullUserProfile(authId: string): Promise<Record<string, unknown> | null> {
  return backendClient.fetch<Record<string, unknown> | null>(
    `*[_type == "userProfile" && authId == $authId][0]`,
    { authId }
  );
}
