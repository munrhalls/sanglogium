import "server-only";
import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
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

export async function hasSessionCookie(): Promise<boolean> {
  return !!getSessionCookie(await headers());
}
