// The signed-in hint: a client-readable mirror of the session, only used to pick the header variant before first paint.
// It is not proof of anything; authClient.useSession stays the truth and corrects a stale hint.
export const AUTH_HINT_COOKIE = "sl_auth";
export const AUTH_HINT_ATTRIBUTE = "data-auth";
// Equals session.expiresIn in features/auth/adapters/better-auth/auth.ts (7 days).
export const AUTH_HINT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
