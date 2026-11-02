import { createClient } from "next-sanity";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// One-off data write, applied 2026-11-02: the accessories sections of the
// filterPicklist document — the headings the filters sidebar shows above its
// controls, in order. Idempotent: sets the same rows again. Touches only
// sectionsAccessories; the other lists and the picks are not here.
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14",
  token: process.env.SANITY_STUDIO_READ_WRITE,
});

// A row is a heading: its title, an icon from the closed list, and the control
// it is shown above. The rows must follow the sidebar's control order (the
// always-on fields, then the owner's picks); a heading holds its control and
// the ones below it down to the next heading.
const rows = [
  { _key: "accCommercial", _type: "section", title: "Commercial", icon: "tag", before: "brand" },
  { _key: "accType", _type: "section", title: "Type & compatibility", icon: "ruler", before: "accessoryType" },
  { _key: "accCable", _type: "section", title: "Cable", icon: "plug", before: "cableFunction" },
  { _key: "accParts", _type: "section", title: "Parts", icon: "gear", before: "partType" },
];

const result = await client.patch("filterPicklist").set({ sectionsAccessories: rows }).commit();
console.log(JSON.stringify(result.sectionsAccessories, null, 1));
