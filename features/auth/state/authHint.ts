"use client";

import { useEffect } from "react";
import { authClient } from "@/features/auth/state/authClient";
import {
  AUTH_HINT_ATTRIBUTE,
  AUTH_HINT_COOKIE,
  AUTH_HINT_MAX_AGE_SECONDS,
} from "@/features/auth/core/definitions/authHint";

export function syncAuthHint(signedIn: boolean): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = signedIn
    ? `${AUTH_HINT_COOKIE}=1; Path=/; Max-Age=${AUTH_HINT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
    : `${AUTH_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  document.documentElement.setAttribute(AUTH_HINT_ATTRIBUTE, signedIn ? "in" : "out");
}

export function clearAuthHint(): void {
  syncAuthHint(false);
}

/** Mirrors the resolved session into the hint. A pending or failed read changes nothing, so a network error never flips a signed-in user to "out". */
export function useAuthHintSync(): void {
  const { data, isPending, error } = authClient.useSession();
  const signedIn = !!data?.session;
  useEffect(() => {
    if (isPending || error) return;
    syncAuthHint(signedIn);
  }, [isPending, error, signedIn]);
}
