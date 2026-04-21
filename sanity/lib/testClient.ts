import { createClient } from "next-sanity";
import dotenv from "dotenv";

// Load .env.test for test dataset configuration
dotenv.config({ path: ".env.test" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "test";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_API_TOKEN;

export const testClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});
