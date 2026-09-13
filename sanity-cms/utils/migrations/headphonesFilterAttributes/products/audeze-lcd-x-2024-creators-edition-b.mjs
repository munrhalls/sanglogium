// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-audeze.md
// (products 2 & 3) for the full per-field table and citation trails this was
// transcribed from.
//
// The Audeze LCD-X specification is model-level, not edition-level, so this
// file is shared verbatim between the two catalogued `_id`s for this SKU
// (they differ only in productId and the Sanity document's name). Per the
// patch tooling's one-product-per-file rule, each `_id` still gets its own
// copy, its own dry run, its own backup, and its own write.

export default {
  productId: "Pn6oyV4Ks5AcNbecjgysXB",
  brand: "Audeze",
  name: "LCD-X Headphones | 2024 Creator's Edition",
  beadsIssue: "sang-logium-1xs.9.7",

  filterAttributes: {
    // awards: null — the page's only award-adjacent phrase is "Trusted by
    //   award winning artists and engineers", which describes the product's
    //   USERS, not an award to the product. Not citable as a product award.
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    connectivity: "wired",
    portable: false, // FLAG — inferred from 612 g open-back + ">250mW" recommended power; see doc
    soundSignature: "Warm", // Crinacle "Warm neutral" + RTINGS "warm sound profile"
    impedanceOhms: 20,
    sensitivityDbMw: 103, // "103 dB/1mW (at Drum Reference Point)"; manual titles the same figure "Efficiency"
    freqResponseHz: { min: 10, max: 50000 },
    microphone: false, // no mic in spec table, package contents, or manual — boolean feature-absence rule
    cableTermination: ["4-pin-xlr", "6.35mm"], // stock 4-pin XLR cable + included 1/4" SE adapter
    detachableCable: true, // manual has an explicit (L)/(R) attach/release procedure
    cableLengthM: 1.9, // "Cable 1.9m (6.2ft) length"
    foldable: false, // only headband-block adjustment described — boolean feature-absence rule
    // ipxRating: NULL — no IP claim anywhere; a spec a manufacturer may omit
    // bluetoothCodecs: NULL — domain-gated, wired-only
    anc: "none", // derived: open-back passive design, no ANC electronics, wired-only
    batteryLifeHours: { ancOff: null, ancOn: null }, // wired-only, no battery (established wired-product convention)
    driverType: ["planar-magnetic"],
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://www.audeze.com/products/lcd-x",
      quote: "Style Over-ear, open-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://www.audeze.com/products/lcd-x",
      quote: "Style Over-ear, open-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.audeze.com/products/lcd-x",
      quote: "Style Over-ear, open-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.audeze.com/products/lcd-x",
      quote: "(analog cable only; no wireless mode anywhere in the specification table)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.audeze.com/products/lcd-x",
      quote:
        'Weight 612g / Recommended power level >250mW / Cable 1.9m (6.2ft) length 4-pin XLR — full-size open-back studio headphone, no case/travel language (absence-based FLAG)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote:
        '"Warm neutral" / "Tonally, a massive improvement over the previous version(s) though with the usual pitfalls of the Audeze house sound." (entry "Audeze LCD-X (2021)", Tone Grade C, Technical Grade A+)',
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://www.audeze.com/products/lcd-x",
      quote: "Impedance 20 ohms",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://www.audeze.com/products/lcd-x",
      quote: "Sensitivity 103 dB/1mW (at Drum Reference Point)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.audeze.com/products/lcd-x",
      quote: "Frequency response 10Hz - 50kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://cdn.shopify.com/s/files/1/3013/1908/files/LCD_UserGuide_FULL_WEB_160222.pdf",
      quote:
        '(no microphone in the LCD-X specification block, the package-contents list — "Single-ended cable (1/4in connector)" / "Balanced cable (4-pin XLR connector)**" / "1/4in to 1/8in mini-adapter" — or the manufacturer product page/spec table; boolean feature-absence rule)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.audeze.com/products/lcd-x",
      quote:
        'Cable 1.9m (6.2ft) length 4-pin XLR with Single ended 1/4" (6.3mm) adapter',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://cdn.shopify.com/s/files/1/3013/1908/files/LCD_UserGuide_FULL_WEB_160222.pdf",
      quote:
        "Look for the (L) and (R) indicators on the cable ends and match them to the headphone's (L) and (R) inputs ... To remove the connector press down on the small black (L) and red (R) button and gently remove the connector",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://www.audeze.com/products/lcd-x",
      quote: "Cable 1.9m (6.2ft) length 4-pin XLR with Single ended 1/4\" (6.3mm) adapter",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://cdn.shopify.com/s/files/1/3013/1908/files/LCD_UserGuide_FULL_WEB_160222.pdf",
      quote:
        "(only headband-block adjustment described; no folding/collapsing hinge anywhere in the structure or comfort sections — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.audeze.com/products/lcd-x",
      quote:
        'Style Over-ear, open-back / (no noise-cancelling feature listed; wired-only — derived from the already-cited acousticDesign + connectivity)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.audeze.com/products/lcd-x",
      quote:
        "(no battery anywhere on the page or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.audeze.com/products/lcd-x",
      quote:
        "Transducer type Planar Magnetic / Diaphragm type Ultra-Thin Uniforce™ / Transducer size 106 mm",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
  ],
};
