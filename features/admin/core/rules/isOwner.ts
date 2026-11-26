import type { SignInFacts } from "@/features/auth";

export const OWNER_SIGN_IN_MAX_AGE_MS = 60 * 60 * 1000;

export function isOwner(facts: SignInFacts | null, owners: string[], now: number): boolean {
  if (!facts || owners.length === 0) return false;
  const email = facts.email.trim().toLowerCase();
  if (email.length === 0 || !owners.includes(email)) return false;
  if (!facts.emailVerified || !facts.twoFactorEnabled) return false;
  if (facts.providers.length === 0 || !facts.providers.every((p) => p === "credential")) return false;
  return now - facts.signedInAt <= OWNER_SIGN_IN_MAX_AGE_MS;
}
