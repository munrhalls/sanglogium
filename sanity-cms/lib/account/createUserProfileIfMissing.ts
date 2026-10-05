import { backendClient } from "@/platform/db/backendClient";
import { getProfileIdByAuthId } from "@/sanity-cms/lib/account/getProfileIdByAuthId";

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
