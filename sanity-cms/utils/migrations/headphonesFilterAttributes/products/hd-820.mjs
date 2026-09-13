// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §3
// for the full per-field table this was transcribed from.
//
// HD 820 is Sennheiser's closed-back flagship — closed-back acoustic design,
// but an editorial "V-shaped" tuning per Crinacle.
//
// NOTE ON THE SPEC LABEL: the manufacturer's spec table labels the driver row
// "Transducer principle (headphones)" rather than plain "Transducer principle"
// as on the other 600-series pages. Value is the same vocabulary: "dynamic, closed".
//
// The live document was mis-storing backDesign: "closed"; that happens to agree
// with this closed-back model, but backDesign is the superseded pre-migration
// name (schema-headphones.md item 12) so the canonical acousticDesign is written.

export default {
  productId: "moXlkADK7m1DHgGwWtbklW",
  brand: "Sennheiser",
  name: "HD 820",
  beadsIssue: "sang-logium-1xs.9.2.3",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"], // "Ear coupling: circumaural"
    acousticDesign: ["closed-back"],
    connectivity: "wired",
    portable: false, // 360 g flagship marketed for home/desktop listening
    driverType: ["dynamic"],
    impedanceOhms: 300,
    sensitivityDbMw: 103, // "103 dB (1 V)"
    freqResponseHz: { min: 6, max: 48000 }, // "6 Hz - 48,000 Hz"
    // Connector/supplied cables: 6.35mm unbalanced + XLR-4 balanced + 4.4mm balanced
    cableTermination: ["6.35mm", "4-pin-xlr", "4.4mm-balanced"],
    detachableCable: true,
    cableLengthM: 3, // "Cable length: 3 m"
    microphone: false, // no manufacturer mention — boolean feature-absence rule
    foldable: false, // same rule
    soundSignature: "V-Shaped", // Crinacle rankings, Tone Grade E
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Ear coupling: circumaural (over-ear form factor)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Impedance: 300 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Sound pressure level (SPL): 103 dB (1 V)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Frequency response (speaker): 6 Hz - 48,000 Hz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Transducer principle (headphones): dynamic, closed",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Cable length: 3 m",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Ear coupling: circumaural",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Transducer principle (headphones): dynamic, closed",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Adapter: XLR-4, balanced, 4-pin Stereo jack plug: 1/4” (6.35 mm), unbalanced, 3-pin 4.4 mm, balanced, 5-pin",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "Adapter: XLR-4, balanced, 4-pin Stereo jack plug: 1/4” (6.35 mm), unbalanced, 3-pin 4.4 mm, balanced, 5-pin",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "detachable cable listed among supplied accessories",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "360 g closed-back flagship marketed for home/desktop listening",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "(no mention across product page and headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://us.sennheiser-hearing.com/products/hd-820",
      quote: "(no mention across product page and headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "V-shaped (Tone Grade E)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
