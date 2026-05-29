import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { Kysely, SqliteDialect } from "kysely";
import { LibsqlDialect } from "kysely-libsql";
import Database from "better-sqlite3";
import { nextCookies } from "better-auth/next-js";

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
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  plugins: [nextCookies()],
});
