// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §11
// for the full per-field table this was transcribed from.
//
// The live document was mis-storing backDesign: "closed" on this open-back
// headphone (backDesign is the superseded pre-migration name — schema-headphones.md
// item 12); the canonical acousticDesign is written here.
//
// soundSignature is null: Crinacle's rankings list has the HD 660S but NOT the
// 660S2, and no individual 660S2 review post exists. The sibling's descriptor
// was deliberately not carried across — different driver/tuning revision.

export default {
  productId: "IVp0Ya0qCxU3IKB1jVguzD",
  brand: "Sennheiser",
  name: "HD 660S2",
  beadsIssue: "sang-logium-1xs.9.2.11",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"], // spec table: "Ear coupling: Over-Ear"
    acousticDesign: ["open-back"], // "Transducer principle: dynamic, open"; headphones.com tags "open-back"
    connectivity: "wired",
    portable: false,
    driverType: ["dynamic"],
    impedanceOhms: 300,
    sensitivityDbMw: 104, // "104 dB (1 kHz, 1 Vrms)"
    freqResponseHz: { min: 8, max: 41500 }, // "Frequency response: 8 – 41,500 Hz"
    cableTermination: ["3.5mm", "6.35mm", "4.4mm-balanced"], // Connector lists 6.3mm jack + 4.4mm balanced; 6.3→3.5mm adapter included
    detachableCable: true, // detachable cable listed as a supplied accessory
    cableLengthM: 1.8, // "Cable length: 1.8m"
    microphone: false, // no manufacturer mention — boolean feature-absence rule
    foldable: false, // same rule
    // soundSignature intentionally omitted — see header note (no Tier 3 entry exists).
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Ear coupling: Over-Ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Impedance: 300 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Sound pressure level (SPL): 104 dB (1 kHz, 1 Vrms)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Frequency response: 8 – 41,500 Hz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Transducer principle: dynamic, open",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Cable length: 1.8m",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Ear coupling: Over-Ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Transducer principle: dynamic, open",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Connector: 6.3 mm (1⁄4 inch) jack plug, 4.4 mm balanced plug",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "Connector: 6.3 mm (1⁄4 inch) jack plug, 4.4 mm balanced plug / Adapter: 6.3 mm (1⁄4 inch) to 3.5 mm",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "detachable cable listed among supplied accessories",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "open-back reference over-ear; no transport or folding design stated",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "(no mention across product page and headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://us.sennheiser-hearing.com/products/hd-660s2",
      quote: "(no mention across product page and headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
