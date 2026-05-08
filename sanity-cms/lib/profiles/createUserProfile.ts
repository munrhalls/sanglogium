import { backendClient } from "../backendClient";
import { UserProfile, CreateProfileOptions } from "./profileTypes";

/**
 * Create a new user profile in Sanity
 *
 * @param options Object containing the profile data to create
 * @returns The created user profile or null if creation failed
 */
export async function createUserProfile(
  options: CreateProfileOptions
): Promise<UserProfile | null> {
  const { clerkId, primaryAddress, preferences } = options;

  // Check if profile already exists
  const existingProfile = await backendClient.fetch(
    `*[_type == "userProfile" && clerkId == $clerkId][0]._id`,
    { clerkId }
  );

  if (existingProfile) {
    console.error(`User profile with clerkId ${clerkId} already exists`);
    return null;
  }

  const now = new Date().toISOString();

  // Create profile document
  const profileData: UserProfile = {
    _type: "userProfile",
    clerkId,

    primaryAddress,
    preferences: preferences || {
      receiveMarketingEmails: false,
      darkMode: false,
      savePaymentInfo: false,
    },
    createdAt: now,
    updatedAt: now,
  };

  try {
    const createdProfile = await backendClient.create(profileData);
    return createdProfile as UserProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
}
