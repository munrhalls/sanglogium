"use server";

import { backendClient } from "@/sanity-cms/lib/backendClient";

interface CreateUserProfileInput {
  authId: string;
  email: string;
  name?: string;
}

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
    console.error("Failed to create user profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user profile",
    };
  }
}
