import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";
import { getProfileIdByAuthId } from "./getProfileIdByAuthId";

export async function createUserProfileIfMissing(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<"existing" | "created"> {
  const existing = await getProfileIdByAuthId(user.id);

  if (existing) {
    return "existing";
  }

  await backendClient.create({
    _type: "userProfile",
    authId: user.id,
    email: user.email,
    name: user.name || "",
  });

  return "created";
}
