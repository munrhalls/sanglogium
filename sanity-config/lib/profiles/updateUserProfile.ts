import { backendClient } from "../backendClient";
import { UserProfile, UpdateProfileOptions } from "./profileTypes";

/**
 * Update specific fields in a user profile
 *
 * @param options Object containing the Clerk ID and fields to update
 * @returns The updated user profile or null if update failed
 */
export async function updateUserProfile(
  options: UpdateProfileOptions,
): Promise<UserProfile | null> {
  const { clerkId, ...fieldsToUpdate } = options;

  // First get the profile ID by Clerk ID
  const profileId = await backendClient.fetch(
    `*[_type == "userProfile" && clerkId == $clerkId][0]._id`,
    { clerkId },
  );

  if (!profileId) {
    console.error(`No user profile found with clerkId ${clerkId}`);
    return null;
  }
  const patch: Record<string, string | number | boolean | object> = {
    updatedAt: new Date().toISOString(),
  };
  if (fieldsToUpdate.primaryAddress) {
    Object.entries(fieldsToUpdate.primaryAddress).forEach(([key, value]) => {
      patch[`primaryAddress.${key}`] = value;
    });
  }

  // Handle preferences updates (patched individually to avoid overwriting the entire object)
  if (fieldsToUpdate.preferences) {
    Object.entries(fieldsToUpdate.preferences).forEach(([key, value]) => {
      patch[`preferences.${key}`] = value;
    });
  }

  try {
    // Apply the patch to the document
    await backendClient.patch(profileId).set(patch).commit();

    // Fetch and return the updated profile
    const updatedProfile = await backendClient.fetch(
      `*[_type == "userProfile" && _id == $profileId][0]`,
      { profileId },
    );

    return updatedProfile as UserProfile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
}
