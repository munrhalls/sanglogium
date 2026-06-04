"use server";

import { backendClient } from "@/sanity-cms/lib/backendClient";

interface CreateUserProfileInput {
  authId: string;
  email: string;
  name?: string;
}

/**
 * Create a Sanity userProfile linked to a Better Auth user.
 *
 * Layer 1 — best-effort creation at sign-up time.
 * If Sanity fails here, the auth user exists without a profile.
 * Layer 2 healing in `lib/auth/dal.ts` (`verifySession()`) will
 * auto-create the missing profile on the first authenticated page load.
 *
 * See docs/auth/userprofile-atomicity-spec-updated.md for full spec.
 */
export async function createUserProfile(input: CreateUserProfileInput) {
  try {
    const existing = await backendClient.fetch(
      `*[_type == "userProfile" && authId == $authId][0]`,
      { authId: input.authId }
    );

    if (existing) {
      return { success: true, docId: existing._id, alreadyExists: true };
    }

    const doc = await backendClient.create({
      _type: "userProfile",
      authId: input.authId,
      email: input.email,
      name: input.name || "",
    });

    return { success: true, docId: doc._id };
  } catch (error) {
    console.error("[AUTH] CRITICAL: userProfile creation failed after sign-up.", {
      authId: input.authId,
      email: input.email,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user profile",
    };
  }
}
