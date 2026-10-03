"use client";

import { authClient } from "@/lib/auth/client";

export async function requireFreshSession(): Promise<boolean> {
  const session = await authClient.getSession();
  if (!session.data?.session) {
    window.location.href = "/sign-in";
    return false;
  }
  // Better Auth computes `fresh` server-side based on freshAge (5 min).
  // Runtime property exists but client types omit it.
  const isFresh = (session.data.session as { fresh?: boolean }).fresh;
  if (!isFresh) {
    window.location.href = "/sign-in";
    return false;
  }
  return true;
}
