import { createClient } from "next-sanity";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// One-off data write, applied 2026-11-02: the audio-electronics sections of the
// filterPicklist document — the headings the filters sidebar shows above its
// controls, in order. Idempotent: sets the same rows again. Touches only
// sectionsAudioElectronics; the other lists and the picks are not here.
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
  { _key: "aeCommercial", _type: "section", title: "Commercial", icon: "tag", before: "brand" },
  { _key: "aeType", _type: "section", title: "Type & form", icon: "gear", before: "deviceType" },
  { _key: "aeConn", _type: "section", title: "Connectivity", icon: "plug", before: "deviceConnectivity" },
  { _key: "aeTech", _type: "section", title: "Technology", icon: "ruler", before: "amplification" },
  { _key: "aeStream", _type: "section", title: "Streaming", icon: "bluetooth", before: "streamingPlatformSupport" },
];

const result = await client.patch("filterPicklist").set({ sectionsAudioElectronics: rows }).commit();
console.log(JSON.stringify(result.sectionsAudioElectronics, null, 1));
