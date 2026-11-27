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

  // A fixed id per account: two page loads that both find no profile still make one document.
  await backendClient.createIfNotExists({
    _id: `userProfile-${user.id}`,
    _type: "userProfile",
    authId: user.id,
    email: user.email,
    name: user.name || "",
  });

  return "created";
}
