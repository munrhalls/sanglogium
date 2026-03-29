import { createClient } from "next-sanity";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: "2024-03-01",
});

const categories = [
  {
    name: "Headphones",
    icon: "headphones",
    subcategories: [
      "Over-Ear",
      "In-Ear",
      "On-Ear",
      "Wireless",
      "Noise-Cancelling",
    ],
  },
  {
    name: "Studio Equipment",
    icon: "microphone",
    subcategories: [
      "Microphones",
      "Audio Interfaces",
      "Studio Monitors",
      "Recording Bundles",
    ],
  },
  {
    name: "Accessories",
    icon: "toolbox",
    subcategories: [
      "Cables",
      "Cases",
      "Stands",
      "Adapters",
      "Replacement Parts",
    ],
  },
  {
    name: "Hi-Fi Audio",
    icon: "music",
    subcategories: ["Amplifiers", "DACs", "Speakers", "Turntables"],
  },
];

async function addSubcategories() {
  for (const category of categories) {
    const subcategories = category.subcategories.map((sub) => ({
      name: sub,
      slug: {
        current: sub
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-"),
      },
    }));

    await client
      .patch(category.id)
      .set({
        subcategories,
      })
      .commit();
  }
}

addSubcategories().then(() => console.log("Subcategories added successfully"));
