import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { Kysely, SqliteDialect } from "kysely";
import { LibsqlDialect } from "kysely-libsql";
import Database from "better-sqlite3";
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail, sendResetPasswordEmail } from "./email";
import { backendClient } from "@/sanity-cms/lib/backendClient";

function validateProductionConfig() {
  if (process.env.NODE_ENV !== "production") return;

  const databaseUrl = process.env.DATABASE_URL || "";

  // Skip validation for local file-based databases (allowed for local production builds)
  if (databaseUrl.startsWith("file:") || databaseUrl.startsWith("sqlite:")) {
    return;
  }

  if (!databaseUrl.startsWith("libsql://") && !databaseUrl.startsWith("http")) {
    throw new Error(
      "[AUTH] Production DATABASE_URL must be a Turso libsql:// URL. " +
        "Current value is not valid for Vercel serverless. " +
        "Run: turso db create sang-logium-auth && turso db show sang-logium-auth --url " +
        "Then set DATABASE_URL in Vercel Dashboard. " +
        "See docs/auth/data-functionality-should-be-intelligence.md for full steps."
    );
  }

  if (databaseUrl.startsWith("libsql://") && !process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      "[AUTH] TURSO_AUTH_TOKEN is required in production when using Turso. " +
        "Generate one with: turso db tokens create sang-logium-auth " +
        "Then set TURSO_AUTH_TOKEN in Vercel Dashboard."
    );
  }
}

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL || "file:./better-auth.db";

  if (databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("http")) {
    return new Kysely({
      dialect: new LibsqlDialect({
        url: databaseUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
    });
  }

  const dbPath = databaseUrl.replace("file:", "").replace("sqlite:", "");
  return new Kysely({
    dialect: new SqliteDialect({
      database: new Database(dbPath),
    }),
  });
}

validateProductionConfig();
const db = createDatabase();

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET is required. Generate one with: openssl rand -base64 32"
  );
}

export const auth = betterAuth({
  database: kyselyAdapter(db, { type: "sqlite" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseUrl: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"].filter(Boolean),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 5,
  },
  rateLimit: {
    window: 60,
    max: 10,
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
            // Do NOT throw — hook failure must not crash the auth flow.
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});
