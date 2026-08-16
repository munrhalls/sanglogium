import dotenv from "dotenv";
import { createClient } from "@sanity/client";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env.local") });

const sharedConfig = {
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-03-06",
};

// Read-only client for querying — used in the Phase 1 dry run.
export const readClient = createClient({
  ...sharedConfig,
  token: process.env.SANITY_API_READ_TOKEN,
});

// Read-write client — used only in Phase 2 for asset upload + document patch.
// SANITY_API_TOKEN lacks "create" permission for asset uploads; SANITY_STUDIO_READ_WRITE
// is the token with sufficient permissions (confirmed working for this exact
// upload+patch operation earlier in this project).
export const writeClient = createClient({
  ...sharedConfig,
  token: process.env.SANITY_STUDIO_READ_WRITE,
});
