import "server-only";
import { backendClient } from "@/platform/sanity/backendClient";

export async function syncUserProfile(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<void> {
  const profile = await backendClient.fetch<{ _id: string; email?: string; name?: string } | null>(
    `*[_type == "userProfile" && authId == $authId][0]{_id, email, name}`,
    { authId: user.id }
  );

  if (profile && (profile.email !== user.email || (profile.name ?? "") !== (user.name || ""))) {
    await backendClient
      .patch(profile._id)
      .set({ email: user.email, name: user.name || "" })
      .commit();
  }
}
