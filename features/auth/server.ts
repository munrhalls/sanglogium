import 'server-only';
// Server-only entry: the auth instance, the session guards and the provider flag. Never import from client components or Node .mjs scripts.
export { auth } from './adapters/betterAuth';
export { verifySession, getSession, requireSession } from './adapters/session';
export { isGoogleAuthEnabled } from './adapters/providers';
export { getProfileIdByAuthId } from './adapters/sanity/getProfileIdByAuthId';
