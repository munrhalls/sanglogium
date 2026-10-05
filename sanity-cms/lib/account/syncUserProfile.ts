import { backendClient } from "@/platform/db/backendClient";
import { getProfileIdByAuthId } from "@/features/auth/adapters/sanity/getProfileIdByAuthId";

export async function syncUserProfile(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<void> {
  const profile = await getProfileIdByAuthId(user.id);

  if (profile?._id) {
    await backendClient
      .patch(profile._id)
      .set({ email: user.email, name: user.name || "" })
      .commit();
  }
}
