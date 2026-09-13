// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §9
// for the full per-field table this was transcribed from.
//
// Re-verified live this pass: the pilot's five manufacturer hard specs and the
// Crinacle descriptor still read verbatim on the manufacturer page — no drift.
// The live document was also found mis-storing backDesign: "closed" on this
// open-back headphone; backDesign is the superseded pre-migration name
// (schema-headphones.md item 12), so the canonical acousticDesign value is
// written here. The stale backDesign sibling is intentionally left untouched.

export default {
  productId: "Pn6oyV4Ks5AcNbecjgrju8",
  brand: "Sennheiser",
  name: "HD 600",
  beadsIssue: "sang-logium-1xs.9.2.9",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    connectivity: "wired",
    portable: false, // reference/desktop headphone, no transport or folding design
    driverType: ["dynamic"],
    impedanceOhms: 300,
    sensitivityDbMw: 97, // "97 dB (1 V)"
    freqResponseHz: { min: 12, max: 40500 },
    cableTermination: ["3.5mm", "6.35mm"], // Connector: 3.5mm stereo jack plug; Adapter: 3.5mm-to-6.35mm
    detachableCable: true, // "detachable, impedance-matched cable"
    cableLengthM: 3,
    microphone: false, // no manufacturer mention — boolean feature-absence rule
    foldable: false, // same rule
    soundSignature: "Neutral", // Crinacle Tone Grade S-, "The legendary neutral reference."
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Ear coupling: circumaural (over-ear form factor)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Impedance: 300 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Sound pressure level (SPL): 97 dB (1 V)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Frequency response (speaker): 12 Hz - 40,500 Hz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Transducer principle: dynamic, open",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Cable length: 3 m",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Ear coupling: circumaural",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Transducer principle: dynamic, open",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Connector: 3.5 mm stereo jack plug",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "Connector: 3.5 mm stereo jack plug / Adapter: 3.5 mm stereo jack plug",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "detachable, impedance-matched cable",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "open circumaural reference headphone, marketed for home/studio listening",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "(no mention across product page and headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://us.sennheiser-hearing.com/products/hd-600",
      quote: "(no mention across product page and headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "Neutral / The legendary neutral reference. (Tone Grade S-)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
