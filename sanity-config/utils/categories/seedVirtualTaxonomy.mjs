import client from "../getClient.mjs";
import { nanoid } from "nanoid";

const rawStructure = [
  {
    title: "Headphones",
    slug: "headphones",
    icon: "headphones",
    groups: [
      {
        title: "By category",
        items: [
          { title: "Wired", slug: "wired" },
          { title: "Wireless", slug: "wireless" },
          { title: "Noise cancelling", slug: "noise-cancelling" },
          { title: "Earbuds", slug: "earbuds" },
        ],
      },
      {
        title: "By fit",
        items: [
          { title: "Over ear", slug: "over-ear" },
          { title: "In ear", slug: "in-ear" },
        ],
      },
      {
        title: "By use",
        items: [
          { title: "Studio and recording", slug: "studio-and-recording" },
          { title: "Gaming", slug: "gaming" },
          { title: "Travel", slug: "travel" },
        ],
      },
    ],
  },
  {
    title: "Speakers",
    slug: "speakers",
    icon: "speaker",
    groups: [
      {
        title: "Home theater",
        items: [
          { title: "Floor standing speakers", slug: "floor-standing-speakers" },
          { title: "Subwoofers", slug: "subwoofers" },
          { title: "Soundbars", slug: "soundbars" },
        ],
      },
      {
        title: "Home Audio",
        items: [
          { title: "Bookshelf speakers", slug: "bookshelf-speakers" },
          { title: "Powered speakers", slug: "powered-speakers" },
        ],
      },
      {
        title: "Portable & Outdoor",
        items: [
          { title: "Bluetooth speakers", slug: "bluetooth-speakers" },
          { title: "Outdoor speakers", slug: "outdoor-speakers" },
        ],
      },
    ],
  },
  {
    title: "Personal Audio",
    slug: "personal-audio",
    icon: "earbuds",
    groups: [
      {
        title: "Audio Players & Devices",
        items: [
          { title: "Digital Audio Players", slug: "digital-audio-players" },
          {
            title: "Bluetooth receivers and transmitters",
            slug: "bluetooth-receivers-and-transmitters",
          },
        ],
      },
      {
        title: "Amplification",
        items: [
          { title: "Portable DACs and Amps", slug: "portable-dacs-and-amps" },
          { title: "Headphone amplifiers", slug: "headphone-amplifiers" },
        ],
      },
      {
        title: "Accessories & Parts",
        items: [
          {
            title: "Phone and Tablet Accessories",
            slug: "phone-and-tablet-accessories",
          },
          {
            title: "Carrying Cases and Protection",
            slug: "carrying-cases-and-protection",
          },
          { title: "Replacement Parts", slug: "replacement-parts" },
        ],
      },
    ],
  },
  {
    title: "Home Audio",
    slug: "home-audio",
    icon: "radio",
    groups: [
      {
        title: "Core components",
        items: [
          { title: "Amplifiers", slug: "amplifiers" },
          { title: "Receivers", slug: "receivers" },
          { title: "Preamps", slug: "preamps" },
        ],
      },
      {
        title: "Source devices",
        items: [
          { title: "Turntables", slug: "turntables" },
          { title: "CD players", slug: "cd-players" },
        ],
      },
      {
        title: "Signal processing",
        items: [
          {
            title: "DACs (Digital-to-Analog Converters)",
            slug: "dacs-digital-to-analog-converters",
          },
        ],
      },
    ],
  },
  {
    title: "Studio Equipment",
    slug: "studio-equipment",
    icon: "mic2",
    groups: [
      {
        title: "Recording Essentials",
        items: [
          { title: "Microphones", slug: "microphones" },
          { title: "Studio monitors", slug: "studio-monitors" },
          { title: "Audio interfaces", slug: "audio-interfaces" },
        ],
      },
      {
        title: "Processing & Accessories",
        items: [
          { title: "Studio Processors", slug: "studio-processors" },
          { title: "Recording accessories", slug: "recording-accessories" },
        ],
      },
    ],
  },
  {
    title: "Accessories",
    slug: "accessories",
    icon: "cable",
    groups: [
      {
        title: "Cables & Wiring",
        items: [
          { title: "Audio cables", slug: "audio-cables" },
          { title: "Power cables", slug: "power-cables" },
          { title: "HDMI Cables", slug: "hdmi-cables" },
          { title: "RCA Cables", slug: "rca-cables" },
          { title: "USB Cables", slug: "usb-cables" },
          { title: "Headphone Cables", slug: "headphone-cables" },
          { title: "Ethernet Cables", slug: "ethernet-cables" },
        ],
      },
      {
        title: "Mounting & Support",
        items: [
          { title: "Wall mounts", slug: "wall-mounts" },
          { title: "Speaker stands", slug: "speaker-stands" },
        ],
      },
      {
        title: "Audio Equipment Accessories",
        items: [
          { title: "Phono Cartridges", slug: "phono-cartridges" },
          {
            title: "Speaker and Subwoofer accessories",
            slug: "speaker-and-subwoofer-accessories",
          },
          { title: "Microphone Accessories", slug: "microphone-accessories" },
        ],
      },
      {
        title: "Power Management",
        items: [{ title: "Power Management", slug: "power-management" }],
      },
    ],
  },
  {
    title: "On Sale",
    slug: "on-sale",
    icon: null,
    groups: [],
  },
];
async function seedCatalogue() {
  console.log("🚀 Building Virtual Taxonomy Tree...");

  const catalogueTree = rawStructure.map((root) => {
    // 1. Root Item
    const rootItem = {
      _key: nanoid(),
      _type: "catalogueItem", // Matches your schema
      type: "link",
      title: root.title,
      slug: { _type: "slug", current: root.slug },
      icon: root.icon,
      children: [],
    };

    // 2. Groups
    if (root.groups && root.groups.length > 0) {
      rootItem.children = root.groups.map((group) => {
        return {
          _key: nanoid(),
          _type: "catalogueItem",
          type: "header",
          title: group.title,
          children: group.items.map((item) => {
            return {
              _key: nanoid(),
              _type: "catalogueItem",
              type: "link",
              title: item.title,
              slug: { _type: "slug", current: item.slug },
              children: [],
            };
          }),
        };
      });
    }
    return rootItem;
  });

  console.log("💾 Writing to Catalogue document...");

  try {
    // UPDATED: Writes to 'catalogue' document type and 'catalogue' field
    const result = await client.createOrReplace({
      _id: "catalogue", // Singleton ID
      _type: "catalogue",
      catalogue: catalogueTree,
    });

    console.log("✅ Virtual Taxonomy Seeded Successfully!");
    console.log(`   Transaction ID: ${result._rev}`);
  } catch (err) {
    console.error("❌ Seed Failed:", err.message);
  }
}

seedCatalogue();
