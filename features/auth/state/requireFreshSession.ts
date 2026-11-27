"use client";

import { authClient } from "./authClient";
import { RECENT_SIGN_IN_SECONDS } from "@/features/auth/core/definitions/recentSignIn";

export async function requireFreshSession(): Promise<boolean> {
  const session = await authClient.getSession();
  if (!session.data?.session) {
    window.location.href = "/sign-in";
    return false;
  }
  const signedInAt = new Date(session.data.session.createdAt).getTime();
  const isFresh = Date.now() - signedInAt < RECENT_SIGN_IN_SECONDS * 1000;
  if (!isFresh) {
    window.location.href = "/sign-in";
    return false;
  }
  return true;
}
