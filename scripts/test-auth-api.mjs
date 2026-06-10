/**
 * Test Better Auth internal API for verification token creation.
 * Imports the auth object from lib/auth.ts to test the exact runtime config.
 */
import 'dotenv/config';

const { auth } = await import('../lib/auth.ts');

console.log('Auth object loaded:', typeof auth, Object.keys(auth).slice(0, 5));

if (auth.api) {
  console.log('Auth API methods:', Object.keys(auth.api));
}
