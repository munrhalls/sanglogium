// Sourced 2026-09-13 — sang-logium-1xs.9.14, HEDD Audio.
// Manufacturer page: https://hedd.audio/products/heddphone-two
// Manufacturer manual: HEDD_HP2_GT_Manual.pdf (spec table, p. with "HEDDphone TWO")
// Writes to filterAttributes.* on the TWO document only. No schema/vocab change.
//
// The pre-existing POC filterAttributes on this document were untrusted
// invented enrichment; none were read as ground truth or used as hints.
// `driverType: "dynamic"` and `backDesign: "closed"` were both wrong for the
// TWO — it is an open-back Air Motion Transformer headphone.
//
// Field notes:
//  - acousticDesign: "Open-back over-ear headphone" (page spec table "Design"
//    row; manual table "Headphone Type: passive, open, circumaural").
//  - driverType: ["amt"] — "Air Motion Transformer with VVT technology and
//    Kapton polyimide diaphragm". The old `dynamic` value is a POC error.
//  - impedanceOhms: 41 — "41 Ω flat" on both the page and the manual table.
//  - sensitivityDbMw: 89 — FLAG, source basis conflict INSIDE the same
//    manufacturer tier. The page spec table reads "Maximum SPL | 89 dB SPL at
//    1 mW"; the manual spec table reads "Sensitivity | 89 dB SPL at 1W". The
//    numeric value agrees (89 dB) but the reference power differs (1 mW vs
//    1 W), which is a ~30 dB discrepancy in headroom terms. The dB/mW basis
//    was chosen to match the field's documented unit and the D1 sibling, and
//    the conflict is recorded here rather than silently averaged.
//  - weightG: recorded in sourcing only where the schema has no field.
//  - cableLengthM: 2.2 — "Includes 2.2m headphone cable with 6.35mm
//    termination; 2.2m balanced cable with 4.4mm termination".
//  - cableTermination: shipping set is 6.35mm unbalanced, 4.4mm balanced, plus
//    6.35mm→3.5mm and 4.4mm→XLR 4-pin adapters. The page's "Inputs | 3.5mm
//    jack" row is the accessory adapter's plug, not the cup connector.
//  - portable: false — FLAG, inferred: full-size open-back, 550 g, no folding.
//  - microphone / foldable: false per the boolean feature-absence rule.
//  - soundSignature: null — EXHAUSTED. Crinacle's only HEDD entry is the
//    original HEDDphone ONE (Warm neutral, Tone A, Technical A+); the TWO has
//    no Crinacle row, no Crinacle post, no ASR lab review, no Rtings review.
//    Not inferred from HEDD's "vivid, lifelike" marketing copy.
//  - fitType / driverConfigBucket / driverConfigDetail: null, domain-gated to
//    IEM. ipxRating / bluetoothCodecs: n/a for a wired passive headphone.

export default {
  productId: "PHPYj28HJdPDHAaIBAK0fG",
  brand: "HEDD Audio",
  name: "HEDDphone TWO",
  beadsIssue: "sang-logium-1xs.9.14",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    fitType: null,
    connectivity: "wired",
    portable: false, // FLAG — inferred from full-size open-back design; travel case is storage only
    microphone: false, // boolean feature-absence rule
    cableTermination: ["3.5mm", "6.35mm", "4.4mm-balanced", "4-pin-xlr"],
    detachableCable: true,
    cableLengthM: 2.2,
    foldable: false, // boolean feature-absence rule
    ipxRating: null,
    bluetoothCodecs: null, // domain-gated, wired-only
    anc: "none", // derived: open-back passive, no electronics
    batteryLifeHours: { ancOff: null, ancOn: null },
    driverType: ["amt"],
    impedanceOhms: 41,
    sensitivityDbMw: 89, // FLAG — page says 89 dB SPL at 1 mW, manual says 89 dB SPL at 1W
    freqResponseHz: { min: 10, max: 40000 },
    awards: null, // no award naming this SKU on the manufacturer page
    driverConfigBucket: null, // domain-gated to IEM
    driverConfigDetail: null,
    soundSignature: null, // exhausted — no sanctioned measurement source covers the TWO
  },

  sourcing: [
    {
      field: "acousticDesign",
      url: "https://hedd.audio/products/heddphone-two",
      quote: "Design | Open-back over-ear headphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://hedd.audio/products/heddphone-two",
      quote: "Design | Open-back over-ear headphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "HEDD_HP2_GT_Manual.pdf — Headphone Type | passive, open, circumaural (over-ear)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "Includes 2.2m headphone cable with 6.35mm termination; 2.2m balanced cable with 4.4mm termination; 3-pin audio adapter – 6.35mm to 3.5mm; 4-pin audio adapter – balanced 4.4mm to XLR (no Bluetooth, wireless, or ANC language anywhere on the page or in the manual)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "Drivers | Air Motion Transformer with VVT technology and Kapton polyimide diaphragm",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://hedd.audio/products/heddphone-two",
      quote: "Impedance | 41 Ω flat (manual table agrees: Impedance | 41 Ω flat)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "Maximum SPL | 89 dB SPL at 1 mW (CONFLICT: HEDD_HP2_GT_Manual.pdf spec table reads \"Sensitivity | 89 dB SPL at 1W\" — value agrees, reference power does not)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "Frequency Range | 10 Hz - 40 kHz (features section: \"VVT allows reproduction of frequencies from 10 to 40kHz\"; manual table agrees)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "Includes 2.2m headphone cable with 6.35mm termination; 2.2m balanced cable with 4.4mm termination",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "Includes 2.2m headphone cable with 6.35mm termination; 2.2m balanced cable with 4.4mm termination; 3-pin audio adapter – 6.35mm to 3.5mm; 4-pin audio adapter – balanced 4.4mm to XLR (the page's \"Inputs | 3.5mm jack\" row is the adapter plug, not the cup connector)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "manual troubleshooting table: \"The cable can easily be replaced\" / \"the cable is not properly connected (pushed all the way in)\" — user-serviceable detachable cables shipped as a pair",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "open-back over-ear, Weight | 550g, no folding position described; travel case is for storage, not travel-first — absence-based FLAG",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "(no microphone, mic, boom, or inline-remote language anywhere on the product page or in the manual — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "(no folding hinge or folded position described anywhere on the page or in the manual; the HEDDband adjusts height, width and curvature but the headphone does not fold — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "(derived from the already-cited acousticDesign: open-back + connectivity: wired — passive acoustic design only, no ANC electronics)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "(no battery anywhere on the page or in the manual — wired-only passive headphone, so ancOff and ancOn are both null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "awards",
      url: "https://hedd.audio/products/heddphone-two",
      quote:
        "(no award, badge, or named recognition claimed for the TWO anywhere on the manufacturer page — the 5-year warranty is not an award)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote:
        "(exhausted NULL — Crinacle's only HEDD entry is the original HEDDphone ONE (Warm neutral, Tone A, Technical A+, AMT); the TWO has no Crinacle row, no Crinacle individual post, no ASR lab review, no Rtings review. Not inferred from HEDD's \"vivid, lifelike\" marketing copy)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
