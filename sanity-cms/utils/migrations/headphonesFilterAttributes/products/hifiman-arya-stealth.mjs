// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-hifiman.md
// (product 1) for the full per-field table and citation trails this was
// transcribed from.

export default {
  productId: "moXlkADK7m1DHgGwWtXu6V",
  brand: "HiFiMan",
  name: "Arya Stealth Magnets",
  beadsIssue: "sang-logium-1xs.9.3",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    connectivity: "wired",
    portable: false, // FLAG — inferred from full-size open-back design + amp-required facet; see doc
    driverType: ["planar-magnetic"],
    impedanceOhms: 32,
    sensitivityDbMw: 94,
    freqResponseHz: { min: 8, max: 65000 },
    cableTermination: ["3.5mm", "6.35mm", "4.4mm-balanced", "4-pin-xlr", "2.5mm-balanced"], // cup socket 3.5mm; stock plug 6.35mm; swappable balanced per manual
    detachableCable: true,
    cableLengthM: 1.5, // stock 6.35mm cable
    microphone: false, // absence across guide + retailer pages — boolean feature-absence rule
    foldable: false, // absence-based inference; only headband-height + swivel described
    soundSignature: "Bright/Analytical", // Crinacle rankings list, Tone Grade A+, Technical S-
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "Impedance: 32 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "Sensitivity: 94 dB",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "Frequency response: 8 Hz-65 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "HIFIMAN utilizes an 'Open Back' design... (planar magnetic construction per manual + retailer facets)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "(1) 1.5m headphone cable (6.35mm)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "HIFIMAN utilizes an 'Open Back' design for best possible sound",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "The Arya package includes a 6.35mm connector cable... if you require a 4.4mm or XLR cable one can easily be swapped over... The Arya itself has 3.5mm sockets",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "The cable is user-replaceable and has channel orientation for left and right",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://headphones.com/products/hifiman-arya-headphones-stealth-magnets-edition",
      quote: "Cup Style: Open-Back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://headphones.com/products/hifiman-arya-headphones-stealth-magnets-edition",
      quote: "Wearing Style: Over-ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://headphones.com/products/hifiman-arya-headphones-stealth-magnets-edition",
      quote: "Connectivity: Wired",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://headphones.com/products/hifiman-arya-headphones-stealth-magnets-edition",
      quote: "Amp Required: Yes (full-size open-back; no case/travel language anywhere — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "(no microphone language in full 16-page owner's guide, headphones.com, or Bloom Audio — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://hifiman.com/attachments/file/20250211/20250211033708_51720.pdf",
      quote: "(only headband-height adjustment and ear-cup swivel described; no folding mechanism — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "High resolution planar that may be a little peaky in the treble for some. (Tone Grade A+, Technical S-)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};