import "server-only";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server Component guard — redirects to /sign-in if unauthenticated.
 * Use in page.tsx files.
 */
export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return {
    isAuth: true as const,
    userId: session.user.id,
    user: session.user,
  };
});

/**
 * API Route / Route Handler guard — returns null if unauthenticated.
 * Never redirects. Caller must return 401.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return {
    isAuth: true as const,
    userId: session.user.id,
    user: session.user,
  };
}

/**
 * Server Action guard — throws if unauthenticated.
 * Use in server actions that mutate data.
 */
export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized: no valid session");
  }

  return {
    isAuth: true as const,
    userId: session.user.id,
    user: session.user,
  };
}
