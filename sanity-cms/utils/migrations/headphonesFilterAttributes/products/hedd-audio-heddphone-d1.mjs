// Sourced 2026-09-13 — sang-logium-1xs.9.14, HEDD Audio.
// Manufacturer page: https://hedd.audio/products/heddphone-d1
// Writes to filterAttributes.* on the D1 document only. No schema/vocab change.
//
// The pre-existing POC filterAttributes on this document were untrusted
// invented enrichment; none were read as ground truth or used as hints.
// `backDesign: "closed"` in particular was flatly contradicted by the
// manufacturer page's "Open-back over-ear headphone".
//
// Field notes:
//  - acousticDesign: replaces the stale `backDesign: "closed"` — the live page
//    states "Open-back over-ear headphone" (spec table "Design" row).
//  - driverType: "dynamic" — the page says "Dynamic with a Thin-ply Carbon
//    Diaphragm". NOT `amt`; the AMT driver belongs to the HEDDphone/TWO.
//  - sensitivityDbMw: 100. The spec table row is "Maximum SPL | 100dB at 1mW"
//    and the FAQ prose repeats "32 Ω impedance and 100 dB sensitivity". The
//    exact "at 1mW" basis is preserved in the paired sourcing quote.
//  - cableLengthM: 2 — "TRS 3.5mm textile-covered premium cable; 2m long".
//  - cableTermination: the D1 ships a 3.5mm TRS cable plus a 6.35mm adapter,
//    with dual 3.5mm mono cup connectors; both plug sizes are recorded.
//  - portable: false — FLAG, inferred: full-size open-back, no folding; the
//    carry case is storage. Matches the Arya/Azurys treatment.
//  - microphone / foldable: false per the boolean feature-absence rule
//    (no mic and no fold language anywhere on the page).
//  - soundSignature: null — EXHAUSTED. No Crinacle rankings row (the list
//    carries only the original "HEDDphone"), no Crinacle individual post, no
//    ASR lab review of the D1, no Rtings review. The D1 page's FR graph is
//    credited to headphones.com, which is not one of the protocol's three
//    sanctioned measurement sources. Not inferred from HEDD's own
//    "reference-grade" / "tonal balance" marketing copy.
//  - fitType / driverConfigBucket / driverConfigDetail: null, domain-gated to
//    IEM. ipxRating / bluetoothCodecs / batteryLifeHours: n/a for a wired
//    passive full-size headphone.

export default {
  productId: "Pn6oyV4Ks5AcNbecjgzEw1",
  brand: "HEDD Audio",
  name: "HEDDphone D1",
  beadsIssue: "sang-logium-1xs.9.14",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    fitType: null,
    connectivity: "wired",
    portable: false, // FLAG — inferred from full-size open-back design; carry case is storage only
    microphone: false, // boolean feature-absence rule
    cableTermination: ["3.5mm", "6.35mm"],
    detachableCable: true,
    cableLengthM: 2,
    foldable: false, // boolean feature-absence rule
    ipxRating: null,
    bluetoothCodecs: null, // domain-gated, wired-only
    anc: "none", // derived: open-back passive, no electronics
    batteryLifeHours: { ancOff: null, ancOn: null },
    driverType: ["dynamic"],
    impedanceOhms: 32,
    sensitivityDbMw: 100,
    freqResponseHz: { min: 5, max: 40000 },
    awards: null, // no award naming this SKU on the manufacturer page
    driverConfigBucket: null, // domain-gated to IEM
    driverConfigDetail: null,
    soundSignature: null, // exhausted — no sanctioned measurement source covers the D1
  },

  sourcing: [
    {
      field: "acousticDesign",
      url: "https://hedd.audio/products/heddphone-d1",
      quote: "Design | Open-back over-ear headphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://hedd.audio/products/heddphone-d1",
      quote: "Design | Open-back over-ear headphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://hedd.audio/products/heddphone-d1",
      quote: "Open-back circumaural design delivers natural openness and spacious soundstage",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "Includes dual 3.5 mm mono connectors; 6.35 mm adapter; and 1 premium textile-covered detachable cable (no Bluetooth, wireless, or ANC language anywhere on the page)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://hedd.audio/products/heddphone-d1",
      quote: "Drivers | Dynamic with a Thin-ply Carbon Diaphragm",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://hedd.audio/products/heddphone-d1",
      quote: "Impedance | 32 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "With 32 Ω impedance and 100 dB sensitivity, the D1 performs consistently across sources from portable players to dedicated amplifiers. (Spec table basis: \"Maximum SPL | 100dB at 1mW\")",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://hedd.audio/products/heddphone-d1",
      quote: "Frequency Range | 5 Hz - 40 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://hedd.audio/products/heddphone-d1",
      quote: "Cable | TRS 3.5mm textile-covered premium cable; 2m long; 6.35mm adapter.",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "Includes dual 3.5 mm mono connectors; 6.35 mm adapter; and 1 premium textile-covered detachable cable (spec table: Cable \"TRS 3.5mm ... 6.35mm adapter\", Inputs \"2 x 3.5mm\")",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "Includes dual 3.5 mm mono connectors; 6.35 mm adapter; and 1 premium textile-covered detachable cable",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "Open-back over-ear headphone ... Custom carry case (full-size open-back, no folding position described; the case is for storage, not travel-first — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "(no microphone, mic, boom, or inline-remote language anywhere on the product page — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "(no folding hinge or folded position described anywhere on the page; the full-size open-back build does not fold — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "(derived from the already-cited acousticDesign: open-back + connectivity: wired — passive acoustic design only, no ANC electronics)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "(no battery anywhere on the page — wired-only passive headphone, so ancOff and ancOn are both null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "awards",
      url: "https://hedd.audio/products/heddphone-d1",
      quote:
        "(no award, badge, or named recognition claimed for the D1 anywhere on the manufacturer page — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote:
        "(exhausted NULL — Crinacle's rankings list carries only the original \"HEDDphone\" (Warm neutral, Tone A, Technical A+, AMT); no D1 row and no Crinacle individual D1 post; no ASR lab review of the D1; no Rtings review. The D1 page's own FR graph is credited to headphones.com, which is not a protocol-sanctioned measurement source, so no label could be derived)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
