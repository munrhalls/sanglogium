// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §7
// for the full per-field table this was transcribed from.
//
// This model turned out to have a FULL manufacturer spec table (unlike the
// Momentum Sport), so most hard specs came straight off it:
//   7mm TrueResponse dynamic driver, 5 Hz–21 kHz, 107 dB SPL (1 kHz / 1 mW).
// The page states "Speaker impedance: Not applicable (active BT headphones)"
// — the manufacturer's own explicit statement that impedance is N/A for an
// active TWS model, which is why impedanceOhms is null rather than unsourced.
//
// ipxRating: manufacturer states "IP54, splash resistant (earbuds only)" —
// IP54 maps to the schema's "IPX4" bucket (IPX4 == splash resistant).
//
// BATTERY NOTE: the spec table and the product description disagree on the
// charge-case total (spec table says "Up to 28 hrs overall"; the marketing
// copy says "8 hours of playtime and 20 additional hours from the case" = 28).
// Both round to the same per-earbud figures used here; only the earbud-level
// ANC-off/ANC-on numbers are written, since those are stated consistently.

export default {
  productId: "ZuUKzmkqDyQwdcwhxl96BU",
  brand: "Sennheiser",
  name: "Accentum True Wireless",
  beadsIssue: "sang-logium-1xs.9.2.7",

  filterAttributes: {
    productCategory: ["true-wireless"],
    wearingStyle: ["in-ear"], // "Ear Coupling: Ear canal"
    acousticDesign: ["closed-back"], // sealed ear-canal design; "Speaker principle: Dynamic"
    fitType: "universal", // interchangeable silicone ear tips S/M/L; no custom-mould option
    connectivity: "true-wireless", // "Bluetooth 5.3 compliant"; no wired audio path
    portable: true, // TWS earbuds with charging case, marketed for mobile use
    driverType: ["dynamic"], // "Speaker type/size: TrueResponse™ dynamic, 7mm diameter"
    sensitivityDbMw: 107, // "Speaker sensitivity: 107 dB SPL (1 kHz / 1 mW)"
    freqResponseHz: { min: 5, max: 21000 }, // "Speaker frequency range: 5 Hz to 21 kHz"
    detachableCable: false, // no cable supplied or supported
    microphone: true, // "Mic principle: MEMS"; "2 mics per earbud, beamforming"
    foldable: false, // no folding hinge exists on earbuds
    anc: "anc", // "Active Noise Cancellation: Hybrid ANC"
    bluetoothCodecs: ["SBC", "AAC", "aptX", "LC3"], // "Supported codecs: SBC, AAC, aptX™, LC3"
    batteryLifeHours: { ancOff: 8, ancOn: 6 }, // "Up to 8 hrs (ANC off); Up to 6 hrs (ANC on)"
    ipxRating: "IPX4", // "IP54, splash resistant (earbuds only)" -> schema IPX4 bucket
    // impedanceOhms intentionally omitted — manufacturer: "Not applicable (active BT headphones)"
    // cableTermination / cableLengthM intentionally omitted — not applicable, true wireless
    // soundSignature intentionally omitted — no Tier 3 measured entry exists
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Wearing style: True wireless stereo earphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Speaker sensitivity: 107 dB SPL (1 kHz / 1 mW)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Speaker frequency range: 5 Hz to 21 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Speaker type/size: TrueResponse™ dynamic, 7mm diameter",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Speaker impedance: Not applicable (active BT headphones)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Ear Coupling: Ear canal",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Speaker principle: Dynamic",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Choose from various ear tip options to find the perfect fit",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Connectivity: Bluetooth 5.3 compliant, class 1, 10 mW (max) Bluetooth Classic supported",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "On-the-go portability: Pocket size charging case",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Mic principle: MEMS / Mic pick-up pattern: 2 mics per earbud, beamforming for noise reduction",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "(no cable supplied or supported; true-wireless earbuds)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "(no folding hinge exists on earbuds; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Active Noise Cancellation: Hybrid ANC",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Supported codecs: SBC, AAC, aptX™, LC3",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Up to 8 hrs music playtime with earbuds (ANC off); Up to 6 hrs music playtime with earbuds (ANC on)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: "https://us.sennheiser-hearing.com/products/accentum-true-wireless",
      quote: "Weather resistance: IP54, splash resistant (earbuds only)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
