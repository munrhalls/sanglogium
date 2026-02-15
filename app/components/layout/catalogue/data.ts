export type CatalogueSection = {
  title: string;
  links: string[];
};

export type CatalogueItem = {
  id: string;
  label: string;
  imageUrl: string;
  sections: CatalogueSection[];
  feature: {
    caption: string;
  };
};

export const CATALOGUE_DATA: CatalogueItem[] = [
  {
    id: "headphones",
    label: "Headphones",
    imageUrl: "/images/headphones-skeletal.png",
    sections: [
      { title: "By Design", links: ["Open-Back", "Closed-Back"] },
      {
        title: "By Driver",
        links: ["Planar Magnetic", "Dynamic", "Electrostatic"],
      },
      {
        title: "In-Ear & Wireless",
        links: ["Monitors (IEMs)", "True Wireless (TWS)"],
      },
    ],
    feature: {
      caption: "Pure Resonance",
    },
  },
  {
    id: "audio-electronics",
    label: "Audio Electronics",
    imageUrl: "/images/audio-electronics-skeletal.png",
    sections: [
      { title: "Amplification", links: ["Desktop Amps", "Portable Amps"] },
      {
        title: "Digital Sources",
        links: [
          "Standalone DACs",
          "DAC/Amp Combos",
          "Digital Players (DAPs)",
          "Network Streamers",
        ],
      },
    ],
    feature: {
      caption: "Signal Integrity",
    },
  },
  {
    id: "accessories",
    label: "Accessories",
    imageUrl: "/images/accessories-skeletal.png",
    sections: [
      {
        title: "Connectivity",
        links: ["Headphone Cables", "Interconnects", "Adapters"],
      },
      { title: "Maintenance", links: ["Earpads", "Care & Cleaning"] },
      { title: "Storage", links: ["Headphone Stands", "Carrying Cases"] },
    ],
    feature: {
      caption: "The Final Detail",
    },
  },
];
