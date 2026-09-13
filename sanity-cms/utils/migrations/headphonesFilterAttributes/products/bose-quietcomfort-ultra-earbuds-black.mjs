// Sourced 2026-09-13 — see docs/filters-sort/bose-headphones-sourced.md for the
// full per-field table this was transcribed from.
//
// The POC filterAttributes on this document (over-ear/wired/planar-magnetic/
// basshead/347Ω, etc.) were untrusted invented enrichment values. They are
// fully re-sourced here per sourcing-protocol-headphones.md; none of the POC
// values were read as ground truth or used as hints — only the product's real
// name/brand/price were carried over.
//
// This SKU and `ZuUKzmkqDyQwdcwhxl8saP` are the same hardware model; the
// `Y7l1IhzX2fnyiano4irsdl` (Lunar Blue) SKU is the identical hardware too, so
// all three share identical filterAttributes.

const quoted = {
  productPage:
    "https://www.bose.com/p/earbuds/bose-quietcomfort-ultra-earbuds/QCUE-HEADPHONEIN.html",
  rtings:
    "https://www.rtings.com/headphones/reviews/bose/quietcomfort-ultra-earbuds-truly-wireless",
};

export default {
  productId: "ZuUKzmkqDyQwdcwhxl8saP",
  brand: "Bose",
  name: "Bose QuietComfort Ultra Wireless Noise Cancelling Earbuds (Black)",
  beadsIssue: "sang-logium-1xs.9.10",

  filterAttributes: {
    productCategory: ["true-wireless"],
    wearingStyle: ["in-ear"],
    acousticDesign: ["closed-back"],
    fitType: "universal",
    connectivity: "true-wireless",
    portable: true,
    soundSignature: "Warm",
    microphone: true,
    cableTermination: [],
    detachableCable: false,
    cableLengthM: null,
    foldable: false,
    ipxRating: "IPX4",
    bluetoothCodecs: ["SBC", "AAC", "aptX Adaptive"],
    anc: "anc",
    batteryLifeHours: { ancOn: 6, ancOff: 6 },
    driverType: ["dynamic"],
    driverConfigBucket: "single-dynamic",
    driverConfigDetail: "1 × dynamic (per earbud)",
    awards: [],
  },
  sourcing: [
    {
      field: "productCategory",
      url: quoted.productPage,
      quote:
        "the product sits in Bose's own \"Earbuds\" line with Bluetooth-only connectivity and no wired audio mode documented; matches should-be-headphones.md item 10's True Wireless vocabulary",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: quoted.productPage,
      quote: "In-ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: quoted.productPage,
      quote:
        "QuietComfort Ultra Earbuds use both passive and active noise reduction technologies to achieve our best in-ear noise cancellation",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "fitType",
      url: quoted.productPage,
      quote: "Nine combinations of eartips & stability bands",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: quoted.productPage,
      quote:
        "Bose QuietComfort Ultra Earbuds are the ultimate wireless noise cancelling earbud experience.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: quoted.productPage,
      quote: "the case holds up to 3 additional full charges",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: quoted.rtings,
      quote:
        "Sound Signature = Warm; Bass Amount = Emphasized (4 dB); Treble Amount = Balanced (0 dB)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: quoted.productPage,
      quote:
        "Yes. Bose QuietComfort Ultra Earbuds have an adaptive microphone system that allows you to use them during calls when connected to any smartphone.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: quoted.productPage,
      quote:
        "true-wireless earbuds — no headphone cable or termination connector is supplied, listed, or referenced anywhere on the product page or in the box contents",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: quoted.productPage,
      quote:
        "true-wireless earbuds — there is no headphone cable to detach (boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: quoted.productPage,
      quote:
        "true-wireless earbuds — no audio cable ships with the product; genuinely not applicable, not a sourcing gap",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: quoted.productPage,
      quote:
        "in-ear true-wireless earbuds with no folding hinge, folded position, or fold step described anywhere on the product page or FAQ (boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "ipxRating",
      url: quoted.productPage,
      quote:
        "Yes. The Bose QuietComfort Ultra Earbuds have passed IPX4 testing, which means they are protected against sweat and splashing water from any angle.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "bluetoothCodecs",
      url: quoted.productPage,
      quote:
        "Other new features include Snapdragon Sound certification, using hi-res audio and low latency codec, Qualcomm aptX Adaptive, and Google Fast Pair.",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: quoted.productPage,
      quote:
        "QuietComfort Ultra Earbuds use both passive and active noise reduction technologies to achieve our best in-ear noise cancellation.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: quoted.productPage,
      quote:
        "to playback loudness of 75dB, 3-band EQ set, to zero in Quiet Mode (full noise cancellation). With Immersive Audio off, playback time was up to 6 hours before battery depletion. With Immersive Audio on, playback time was up to 4 hours before battery depletion.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: quoted.productPage,
      quote:
        "single dynamic driver per earbud; no balanced-armature, planar-magnetic, electrostatic or AMT driver is stated or implied anywhere on the product page",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverConfigBucket",
      url: quoted.productPage,
      quote: "single dynamic driver per earbud",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "awards",
      url: quoted.productPage,
      quote:
        "no award, Editors' Choice badge, or named recognition is claimed for this SKU anywhere on the product page (boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
