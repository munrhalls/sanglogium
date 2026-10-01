"use client";

import { authClient } from "@/lib/auth-client";

/**
 * Shared sign-out utility.
 * Always redirects to /sign-in after sign-out, even on error.
 * Uses window.location.href for a full page reload, ensuring
 * all client-side auth state is cleared consistently.
 */
export async function signOut(): Promise<void> {
  try {
    await authClient.signOut();
  } catch {
    // Non-fatal — proceed to redirect regardless.
    // A network error or stale session should still land the user
    // on the sign-in page rather than leaving them stranded.
  }
  window.location.href = "/sign-in";
}

/**
 * Sign out from all devices.
 * Validates session freshness first, then revokes all sessions.
 * Always redirects to /sign-in.
 */
export async function signOutAllDevices(): Promise<void> {
  try {
    const session = await authClient.getSession();
    if (!session.data?.session) {
      window.location.href = "/sign-in";
      return;
    }
    const isFresh = (session.data.session as { fresh?: boolean }).fresh;
    if (!isFresh) {
      window.location.href = "/sign-in";
      return;
    }

    await authClient.revokeSessions();
  } catch {
    // Non-fatal — proceed to redirect regardless.
  }
  window.location.href = "/sign-in";
}
