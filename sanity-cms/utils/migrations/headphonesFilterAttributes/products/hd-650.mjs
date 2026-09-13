// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §10
// for the full per-field table this was transcribed from.
//
// MANUFACTURER SELF-CONTRADICTION on freqResponseHz, resolved by recency per
// the sourcing protocol's 2026-09-13 amendment (no human-flag gate):
//   - marketing bullet list:  "Frequency response: 12 – 41,000 Hz"
//   - spec table (authoritative): "Frequency response (speaker): 10 Hz - 41,000 Hz"
// The spec table is the current, structured manufacturer figure and is what's
// written; the marketing bullet is a rounded/legacy paraphrase. Both recorded.
//
// Also note the live document was mis-storing backDesign: "closed" on this
// open-back headphone (backDesign is the superseded pre-migration name —
// schema-headphones.md item 12); the canonical acousticDesign is written here.

export default {
  productId: "Pn6oyV4Ks5AcNbecjgrpEU",
  brand: "Sennheiser",
  name: "HD 650",
  beadsIssue: "sang-logium-1xs.9.2.10",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"], // headphones.com tags this SKU "open-back" (corroborating)
    connectivity: "wired",
    portable: false,
    driverType: ["dynamic"],
    impedanceOhms: 300,
    sensitivityDbMw: 103, // spec table: "103 dB (1 V)" — not the HD 600's 97 dB
    freqResponseHz: { min: 10, max: 41000 }, // spec table; marketing bullet says "12 – 41,000 Hz"
    cableTermination: ["3.5mm", "6.35mm"], // Connector: 6.35mm stereo jack plug; Adapter: to 3.5mm
    detachableCable: true,
    cableLengthM: 3,
    microphone: false, // no manufacturer mention — boolean feature-absence rule
    foldable: false, // same rule
    soundSignature: "Warm", // Crinacle "Warm neutral", Tone Grade A+ (nearest schema member)
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Ear coupling: circumaural (over-ear form factor)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Impedance: 300 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Sound pressure level (SPL): 103 dB (1 V)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Frequency response (speaker): 10 Hz - 41,000 Hz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Transducer principle: dynamic, open",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Cable length: 3 m",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Ear coupling: circumaural",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Transducer principle: dynamic, open",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Connector: 1/4” (6.35 mm) stereo jack plug",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "Connector: 1/4” (6.35 mm) stereo jack plug / Adapter: 1/4* (6,35 mm) stereo jack plug to 3,5 mm stereo jack plug",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "the HD 650 utilizes a 9.8' detachable cable made from a highly conductive OFC copper",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "reference/desktop open-back headphone; no transport or folding design stated",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "(no mention across product page and headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://us.sennheiser-hearing.com/products/hd-650",
      quote: "(no mention across product page and headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "Warm neutral (Tone Grade A+)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
