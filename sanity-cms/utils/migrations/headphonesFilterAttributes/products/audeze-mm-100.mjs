// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-audeze.md
// (product 6) for the full per-field table and citation trails this was
// transcribed from.

export default {
  productId: "Pn6oyV4Ks5AcNbecjgz0Fr",
  brand: "Audeze",
  name: "MM-100 Headphones",
  beadsIssue: "sang-logium-1xs.9.7",

  filterAttributes: {
    // awards: null — page's only award-adjacent phrase credits collaborator
    //   "Grammy award-winning engineer/producer Manny Marroquin", not an award
    //   to this headphone.
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    connectivity: "wired",
    portable: true, // 3.5mm-terminated cable + storage bag; RTINGS: "you can use them with a phone or laptop"
    soundSignature: "Neutral", // RTINGS: "flat sound profile ... treble response is notably recessed" (sole Tier-3 source)
    impedanceOhms: 18,
    sensitivityDbMw: 98, // "98 dB/1mW (at Drum Reference Point)"
    freqResponseHz: { min: 20, max: 25000 },
    microphone: false, // no mic in spec block, included items, or feature copy — boolean feature-absence rule
    cableTermination: ["3.5mm", "6.35mm"], // "Single ended 3.5mm TRS to 1/4\" TRS" + included 1/4"-to-3.5mm adapter
    detachableCable: true, // FLAG — cable is a discrete included item; the MM-100 quick-start guide PDF was not opened this pass
    cableLengthM: 2.5, // "Cable 2.5m (8.2ft)" — manufacturer's own dual-unit figure
    foldable: false, // magnesium yokes + spring-steel headband, no fold claim — boolean feature-absence rule
    // ipxRating: NULL — no IP claim anywhere; a spec a manufacturer may omit
    // bluetoothCodecs: NULL — domain-gated, wired-only
    anc: "none", // derived: open-back passive design, no ANC electronics, wired-only
    batteryLifeHours: { ancOff: null, ancOn: null }, // wired-only, no battery (established wired-product convention)
    driverType: ["planar-magnetic"],
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://www.audeze.com/products/mm-100",
      quote: "Style Over-ear, open-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://www.audeze.com/products/mm-100",
      quote: "Style Over-ear, open-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.audeze.com/products/mm-100",
      quote: "Style Over-ear, open-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.audeze.com/products/mm-100",
      quote: "(analog cable only; no wireless mode anywhere in the specification table)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.audeze.com/products/mm-100",
      quote:
        'Cable 2.5m (8.2ft) Single ended 3.5mm TRS to 1/4" TRS / Includes: ... Soft Storage Bag ... / Versatile: High efficiency drivers, works well with wide variety of equipment',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://www.rtings.com/headphones/reviews/audeze/mm-100",
      quote:
        "Their frequency response mostly follows their flat sound profile, with a few major peaks and dips. The sound profile is relatively well-aligned with our target in the bass and mid-range, though the treble response is notably recessed",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://www.audeze.com/products/mm-100",
      quote: "Impedance 18 ohms",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://www.audeze.com/products/mm-100",
      quote: "Sensitivity 98 dB/1mW (at Drum Reference Point)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.audeze.com/products/mm-100",
      quote: "Frequency response 20Hz - 25kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://www.audeze.com/products/mm-100",
      quote:
        '(no microphone in the specification block, the included-items list, or the page\'s feature copy; boolean feature-absence rule)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.audeze.com/products/mm-100",
      quote:
        'Cable 2.5m (8.2ft) Single ended 3.5mm TRS to 1/4" TRS / Includes: ... 1/4" to 3.5mm adapter',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://www.audeze.com/products/mm-100",
      quote:
        'Includes: MM-100 Headphone | Braided Headphone Cable | Soft Storage Bag | Certificate of Authenticity and Warranty Cards | 1/4" to 3.5mm adapter (cable listed as a discrete item; no captive-cable language on the page — FLAG: MM-100 quick-start guide PDF not opened this pass)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://www.audeze.com/products/mm-100",
      quote: 'Cable 2.5m (8.2ft) Single ended 3.5mm TRS to 1/4" TRS',
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://www.audeze.com/products/mm-100",
      quote:
        "(magnesium yokes and spring-steel headband described; no folding/collapsing hinge anywhere in the specification block or structure copy — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.audeze.com/products/mm-100",
      quote:
        'Style Over-ear, open-back / (no noise-cancelling feature listed; wired-only — derived from the already-cited acousticDesign + connectivity)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.audeze.com/products/mm-100",
      quote:
        "(no battery anywhere on the page or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.audeze.com/products/mm-100",
      quote:
        'Transducer type Planar Magnetic / Magnetic structure Fluxor™ magnet array / Diaphragm type Ultra-Thin Uniforce™ / Transducer size 90 mm',
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
  ],
};
