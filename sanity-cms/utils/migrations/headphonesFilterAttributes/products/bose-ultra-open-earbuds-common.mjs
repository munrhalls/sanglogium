// Sourced 2026-09-13 — see docs/filters-sort/bose-headphones-sourced.md for the
// full per-field table this was transcribed from. Shared base spec for the two
// Bose Ultra Open Earbuds colourway SKUs; each colourway file re-exports this
// with its own productId/name. Not a patchable spec on its own.

const productPage =
  "https://www.bose.com/p/earbuds/bose-ultra-open-earbuds/ULT-HEADPHONEOPN.html";
const rtings = "https://www.rtings.com/headphones/reviews/bose/ultra-open-earbuds";

export default {
  productId: "UNUSED_BASE_SPEC",
  brand: "Bose",
  beadsIssue: "sang-logium-1xs.9.10",

  filterAttributes: {
    // Open-ear by Bose's own fit taxonomy ("Headphone Fit: Open Ear"), while the
    // broad product type stays an earbuds/TWS product per should-be item 10.
    productCategory: ["true-wireless"],
    wearingStyle: ["in-ear"],
    acousticDesign: ["semi-open"],
    fitType: "universal",
    connectivity: "true-wireless",
    portable: true,
    soundSignature: "Bright/Analytical",
    microphone: true,
    cableTermination: [],
    detachableCable: false,
    cableLengthM: null,
    foldable: false,
    ipxRating: "IPX4",
    bluetoothCodecs: ["SBC", "AAC"],
    anc: "none",
    batteryLifeHours: { ancOn: 7.5, ancOff: 7.5 },
    driverType: ["dynamic"],
    driverConfigBucket: "other",
    driverConfigDetail: "1 × dipole transducer per earbud",
    awards: [],
  },
  sourcing: [
    {
      field: "productCategory",
      url: productPage,
      quote:
        "Ultra Open Earbuds feature a brilliant combination of innovative open-ear design, incredible audio, and all-day comfort.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: productPage,
      quote: "In-ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: productPage,
      quote:
        "Headphone Fit: Open Ear ... Bose OpenAudio ... without sealing your ear. Each earbud uses a tiny dipole transducer system engineered for loud-and-clear personal audio that stays at the ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: productPage,
      quote: "Fit: Light-as-air Flex Grip",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: productPage,
      quote:
        "Wireless Connectivity: A2DP Bluetooth Audio Streaming, Bluetooth, Bluetooth Low Energy, HFP Bluetooth, Wireless Connectivity, AAC Bluetooth, SBC Bluetooth",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: productPage,
      quote: "Case: Charging, Protection — up to an extra 19.5 hours of battery life in the charging case",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: rtings,
      quote:
        "Sound Signature = Bright; Bass Amount = Very Underemphasized (-18 dB); Treble Amount = Balanced (-1 dB)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: productPage,
      quote: "Microphones: Built-in Microphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: productPage,
      quote:
        "true-wireless open-ear earbuds — no headphone cable or termination connector is supplied, listed, or referenced anywhere on the product page or in the box contents",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: productPage,
      quote:
        "true-wireless earbuds — there is no headphone cable to detach (boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: productPage,
      quote:
        "true-wireless earbuds — no audio cable ships with the product; genuinely not applicable, not a sourcing gap",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: productPage,
      quote:
        "cuff-like open-ear earbuds with no folding hinge, folded position, or fold step described anywhere on the product page or FAQ (boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: productPage,
      quote: "Water Resistant: IPX4; IPX4 rating for water resistance",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: productPage,
      quote:
        "Wireless Connectivity: A2DP Bluetooth Audio Streaming, Bluetooth, Bluetooth Low Energy, HFP Bluetooth, Wireless Connectivity, AAC Bluetooth, SBC Bluetooth",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: productPage,
      quote:
        "Noise Cancelling: No — the open-ear design leaves the ear canal unsealed; no active noise cancelling, Quiet Mode, or passive-isolation claim appears on the product page or in the specifications table",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: productPage,
      quote:
        "With Immersive Audio off, playback time was up to 7.5 hours before battery depletion. With Immersive Audio on, playback time was up to 4.5 hours before battery depletion. Battery life varies based on settings and usage.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: productPage,
      quote:
        "Each earbud uses a tiny dipole transducer system engineered for loud-and-clear personal audio that stays at the ear — a single moving-coil transducer per earbud; no balanced-armature, planar-magnetic, electrostatic or AMT driver is stated or implied anywhere on the product page",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverConfigBucket",
      url: productPage,
      quote:
        "Each earbud uses a tiny dipole transducer system — one transducer per earbud; matches none of single-dynamic / single-ba / multi-ba / hybrid-config / planar, so the bucket is \"other\"",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "awards",
      url: productPage,
      quote:
        "no award, Editors' Choice badge, or named recognition is claimed for this SKU anywhere on the product page (boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};


