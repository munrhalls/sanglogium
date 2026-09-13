import dotenv from "dotenv";
import { createClient } from "@sanity/client";
import path from "path";
import { fileURLToPath } from "url";

// Mirrors sanity-cms/utils/migrations/normalizeIemImages/getClient.mjs's
// proven token split — the top-level sanity-cms/utils/getClient.mjs expects
// SANITY_STUDIO_READ_WRITE_CREATE, which isn't set in this project's
// .env.local; SANITY_API_READ_TOKEN / SANITY_STUDIO_READ_WRITE are.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env.local") });

const sharedConfig = {
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-03-06",
};

export const readClient = createClient({
  ...sharedConfig,
  token: process.env.SANITY_API_READ_TOKEN,
});

// Writes go to the production dataset. Used only when runPatch.mjs is
// invoked with --write.
export const writeClient = createClient({
  ...sharedConfig,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});
