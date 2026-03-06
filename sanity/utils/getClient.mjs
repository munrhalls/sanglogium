import dotenv from "dotenv";
import { createClient } from "@sanity/client";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Wychodzimy dwa poziomy wyżej z sanity/utils do root
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  useCdn: false,
  token: process.env.SANITY_API_READWRITEDELETE_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-06',
});

export default client;