import "server-only";
import { cache } from "react";
import type { createAuth } from "./auth";
import type { UserProfiles } from "@/features/auth/core/ports";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export function createSessionReaders(
  auth: ReturnType<typeof createAuth>,
  profiles: UserProfiles
) {
  // In-memory cache: userId -> { knownGood: boolean, expiresAt: number }
  // TTL: 5 minutes. Per-request on Vercel serverless; still valuable for
  // repeated calls within the same request tree (React cache() + Suspense).
  const profileCache = new Map<string, { knownGood: boolean; expiresAt: number }>();
  const CACHE_TTL_MS = 5 * 60 * 1000;

  function isCached(userId: string): boolean {
    const entry = profileCache.get(userId);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      profileCache.delete(userId);
      return false;
    }
    return entry.knownGood;
  }

  function markCached(userId: string) {
    profileCache.set(userId, { knownGood: true, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  /**
   * Defensive healing: ensure a Sanity userProfile exists for the auth user.
   * Runs inside verifySession() only — not in getSession() or requireSession().
   * Idempotent (fetch-before-create). Never throws (logs on Sanity failure).
   */
  async function ensureUserProfile(user: { id: string; email: string; name?: string | null }) {
    if (isCached(user.id)) return;

    try {
      const result = await profiles.createUserProfileIfMissing(user);
      markCached(user.id);

      if (result === "created") {
        console.log("[AUTH] HEAL: userProfile created on demand.", {
          authId: user.id,
          email: user.email,
        });
      }
    } catch (error) {
      console.error("[AUTH] HEAL FAILED: could not create userProfile on demand.", {
        authId: user.id,
        email: user.email,
        error: error instanceof Error ? error.message : String(error),
      });
      // Do NOT throw — auth must not be blocked by Sanity availability.
    }
  }

  /**
   * Server Component guard — redirects to /sign-in if unauthenticated.
   * Use in page.tsx files.
   *
   * Layer 2 healing: auto-creates missing userProfile on first protected
   * page load.
   */
  const verifySession = cache(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      redirect("/sign-in");
    }

    await ensureUserProfile(session.user);

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
  async function getSession() {
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
  async function requireSession() {
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

  return { getSession, requireSession, verifySession };
}
