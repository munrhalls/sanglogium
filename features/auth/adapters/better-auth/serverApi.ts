import "server-only";
import { headers } from "next/headers";
import { toNextJsHandler } from "better-auth/next-js";
import type { createAuth } from "./auth";

type Auth = ReturnType<typeof createAuth>;

export function createRouteHandlers(auth: Auth) {
  return toNextJsHandler(auth);
}

export function createUserNameUpdater(auth: Auth) {
  return async (name: string): Promise<void> => {
    await auth.api.updateUser({ headers: await headers(), body: { name } });
  };
}

export function createSignInRecordReader(auth: Auth) {
  return async () => {
    const requestHeaders = await headers();
    const [sessions, accounts] = await Promise.all([
      auth.api.listSessions({ headers: requestHeaders }),
      auth.api.listUserAccounts({ headers: requestHeaders }),
    ]);
    // Field by field: session keys, password hashes and two-factor secrets never leave.
    return {
      signInMethods: accounts.map((account) => ({ method: account.providerId, addedAt: account.createdAt })),
      devices: sessions.map((session) => ({
        signedInAt: session.createdAt,
        lastActiveAt: session.updatedAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
      })),
    };
  };
}
