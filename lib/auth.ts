import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { Kysely } from "kysely";
import { LibsqlDialect } from "kysely-libsql";
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail, sendResetPasswordEmail } from "./email";
import { backendClient } from "@/sanity-cms/lib/backendClient";

function validateDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL || "";

  if (!databaseUrl.startsWith("libsql://") && !databaseUrl.startsWith("http")) {
    throw new Error(
      "[AUTH] DATABASE_URL must be a Turso libsql:// URL. " +
        "Current value is not valid. " +
        "Run: turso db create sang-logium-auth && turso db show sang-logium-auth --url " +
        "Then set DATABASE_URL and TURSO_AUTH_TOKEN in your environment."
    );
  }

  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      "[AUTH] TURSO_AUTH_TOKEN is required. " +
        "Generate one with: turso db tokens create sang-logium-auth " +
        "Then set TURSO_AUTH_TOKEN in your environment."
    );
  }
}

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "[AUTH] DATABASE_URL is not set. " +
        "Set it to your Turso database URL (libsql://...)."
    );
  }

  return new Kysely({
    dialect: new LibsqlDialect({
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    }),
  });
}

validateDatabaseConfig();
const db = createDatabase();

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET is required. Generate one with: openssl rand -base64 32"
  );
}

export const auth = betterAuth({
  database: kyselyAdapter(db, { type: "sqlite" }),
  secret: process.env.BETTER_AUTH_SECRET,
  secrets: process.env.BETTER_AUTH_SECRETS
    ? process.env.BETTER_AUTH_SECRETS.split(",").map((entry) => {
        const [versionStr, value] = entry.split(":");
        return { version: parseInt(versionStr, 10), value };
      })
    : undefined,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"].filter(Boolean),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 5,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
  },
  rateLimit: {
    window: 60,
    max: 10,
    customRules: {
      "/sign-in/email": { window: 15 * 60, max: 5 },
      "/sign-up/email": { window: 60 * 60, max: 3 },
      "/forget-password": { window: 60 * 60, max: 3 },
    },
  },
  emailVerification: {
    sendVerificationEmail,
    sendOnSignUp: true,
    expiresIn: 60 * 60,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: sendResetPasswordEmail,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const existing = await backendClient.fetch(
              `*[_type == "userProfile" && authId == $authId][0]`,
              { authId: user.id }
            );
            if (existing) return;

            await backendClient.create({
              _type: "userProfile",
              authId: user.id,
              email: user.email,
              name: user.name || "",
            });

            console.log("[AUTH] HOOK: userProfile created via databaseHooks.", {
              authId: user.id,
              email: user.email,
            });
          } catch (error) {
            console.error("[AUTH] HOOK FAILED: userProfile creation failed in databaseHooks.", {
              authId: user.id,
              email: user.email,
              error: error instanceof Error ? error.message : String(error),
            });
            // CRITICAL: Better Auth `databaseHooks.user.create.after` runs AFTER
            // the user is already persisted. True atomic rollback is impossible here.
            // The user now exists in Better Auth without a linked userProfile.
            //
            // Mitigation (healing): `lib/auth/dal.ts` `ensureUserProfile()` auto-creates
            // the missing profile on the first authenticated page load (Server Components
            // via `verifySession()`). This acts as a deferred cleanup/flagging strategy.
            //
            // For full atomicity, a custom server action wrapping BOTH user creation
            // AND profile creation in a transaction would be required — but that
            // would bypass Better Auth's built-in endpoints and is out of scope.
            // See docs/auth/userprofile-atomicity-spec-updated.md
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});
