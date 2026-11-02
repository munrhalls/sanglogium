import { createClient } from "next-sanity";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// One-off data write, applied 2026-11-02: the headphones sections of the
// filterPicklist document — the headings the filters sidebar shows above its
// controls, in order. Idempotent: sets the same rows again. Touches only
// sectionsHeadphones; the other lists and the picks are not here.
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
  { _key: "0f0c6551dbae", _type: "section", title: "Commercial", icon: "tag", before: "brand" },
  { _key: "hpDesign", _type: "section", title: "Design & connectivity", icon: "plug", before: "acousticDesign" },
  { _key: "hpSound", _type: "section", title: "Sound & specs", icon: "sound", before: "soundSignature" },
  { _key: "hpMicCable", _type: "section", title: "Microphone & cable", icon: "microphone", before: "microphone" },
  { _key: "hpTravel", _type: "section", title: "Travel & durability", icon: "gear", before: "foldable" },
  { _key: "hpWireless", _type: "section", title: "Wireless & battery", icon: "bluetooth", before: "bluetoothCodecs" },
  { _key: "hpDriver", _type: "section", title: "Driver", icon: "ruler", before: "driverType" },
];

const result = await client.patch("filterPicklist").set({ sectionsHeadphones: rows }).commit();
console.log(JSON.stringify(result.sectionsHeadphones, null, 1));
