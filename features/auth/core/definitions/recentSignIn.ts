// How long after signing in a person may change email or password, turn two-factor on or off, or delete the account.
// The server (session.freshAge in adapters/better-auth/auth.ts) and the account page both use this number.
export const RECENT_SIGN_IN_SECONDS = 60 * 5;
