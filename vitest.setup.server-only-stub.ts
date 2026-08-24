// "server-only" isn't an installed dependency — Next.js resolves it via a
// built-in shim during its own build. Vitest has no such shim, so any test
// that imports a component chain reaching a server-only module (e.g. via
// WishlistButton -> a "use server" action -> lib/auth/dal.ts) fails to
// resolve it. This stub gives Vitest something to resolve to; it's a no-op.
export {};
