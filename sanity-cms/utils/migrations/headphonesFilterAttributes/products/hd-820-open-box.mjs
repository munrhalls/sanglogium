// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §5
// for the full per-field table this was transcribed from.
//
// VERIFY-DON'T-ASSUME: this is an Open Box listing of the SAME HD 820 hardware
// — a different Sanity document and SKU price, the same physical product. The
// live document was read directly and carried the same bare pre-migration
// baseline as the retail HD 820, with no independent spec data of its own.
// Every value below was therefore re-verified against the same live
// manufacturer page before being written; nothing was inherited on the
// strength of the product name alone. Values intentionally mirror hd-820.mjs.

export default {
  productId: "n10eAegrGspodtsQvneQzx",
  brand: "Sennheiser",
  name: "HD 820 - Open Box",
  beadsIssue: "sang-logium-1xs.9.2.5",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "wired",
    portable: false,
    driverType: ["dynamic"],
    impedanceOhms: 300,
    sensitivityDbMw: 103,
    freqResponseHz: { min: 6, max: 48000 },
    cableTermination: ["6.35mm", "4-pin-xlr", "4.4mm-balanced"],
    detachableCable: true,
    cableLengthM: 3,
    microphone: false,
    foldable: false,
    soundSignature: "V-Shaped",
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
