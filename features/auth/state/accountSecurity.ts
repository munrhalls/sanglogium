"use client";

import { authClient } from "./authClient";

type AuthResult = Promise<{ error: { message: string | null } | null }>;

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}): AuthResult {
  const { error } = await authClient.changePassword(input);
  return { error: error ? { message: error.message ?? null } : null };
}

export async function changeEmail(input: {
  newEmail: string;
  callbackURL: string;
}): AuthResult {
  const { error } = await authClient.changeEmail(input);
  return { error: error ? { message: error.message ?? null } : null };
}

export async function deleteAccount(input: { password: string }): AuthResult {
  const { error } = await authClient.deleteUser(input);
  return { error: error ? { message: error.message ?? null } : null };
}

export function useIsSignedIn(): boolean {
  const { data } = authClient.useSession();
  return !!data?.session;
}
