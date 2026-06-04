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
 * ATOMICITY GAP: This runs AFTER Better Auth creates the user.
 * If Sanity fails here, the auth user exists without a profile.
 * Full fix requires moving sign-up into a server action that
 * creates both atomically (or rolls back the auth user).
 * See docs/auth/data-functionality-should-be-intelligence-update.md
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
