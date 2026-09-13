import dotenv from "dotenv";
import { createClient } from "@sanity/client";
import path from "path";
import { fileURLToPath } from "url";

// Same token split as normalizeIemImages/getClient.mjs and
// headphonesFilterAttributes/getClient.mjs: read via SANITY_API_READ_TOKEN,
// write via SANITY_STUDIO_READ_WRITE (the project does not set
// SANITY_STUDIO_READ_WRITE_CREATE).

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

export const writeClient = createClient({
  ...sharedConfig,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});
