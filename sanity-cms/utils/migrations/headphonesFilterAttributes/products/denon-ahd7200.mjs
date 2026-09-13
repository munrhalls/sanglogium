// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-denon.md §2
// for the full per-field table this was transcribed from.
//
// Unlike its sibling AH-D9200, this model's live Denon page does publish a
// spec block, and it carries the explicit "Folding Mechanism: No" statement
// plus "Active NC: No" / "Bluetooth: No". H-tier numbers are cross-checked
// between that page, the info-sheet PDF and the owner's-manual PDF — all
// three agree on impedance / sensitivity / frequency response / cable length.
//
// acousticDesign is the same FLAG as the AH-D9200: no manufacturer wording
// of open/closed exists on any Denon document, so it comes from the
// audited-retailer tier (Audio46's product tag block). The superseded
// pre-migration siblings on the document (backDesign / connector /
// noiseCancelling) are intentionally left untouched.

export default {
  productId: "moXlkADK7m1DHgGwWtbnF3",
  brand: "Denon",
  name: "AH-D7200 Headphones",
  beadsIssue: "sang-logium-1xs.9.12",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"], // manufacturer spec "Type: Over-Ear"
    acousticDesign: ["closed-back"], // FLAG — retailer-tier; manufacturer page never states it
    fitType: null, // not an IEM
    connectivity: "wired", // "Active NC: No", "Bluetooth: No" — analog detachable cables only
    portable: true, // FLAG — inferred on the same over-ear + detachable-cable basis as the AH-D9200
    soundSignature: "Mid-Forward", // Crinacle "Mid-centric" — closest enum member, see doc gap 2
    impedanceOhms: 25,
    sensitivityDbMw: 105, // "105 dB/mW"
    freqResponseHz: { min: 5, max: 55000 },
    microphone: false, // no manufacturer mention — boolean feature-absence rule
    cableTermination: ["3.5mm", "6.35mm"], // "6.3 mm (Player), 3.5 mm x2 (headphones)"
    detachableCable: true, // "Detachable Cable: 3.0m 7N Purity Cable"
    cableLengthM: 3,
    foldable: false, // manufacturer spec states explicitly "Folding Mechanism: No"
    ipxRating: null, // no manufacturer IP claim
    bluetoothCodecs: null, // "Bluetooth: No"
    anc: "passive", // "Active NC: No" + closed walnut housing — no ANC electronics
    batteryLifeHours: null, // wired-only
    driverType: ["dynamic"], // info sheet "Dynamic (Nano-fibre/paper diaphragm + Free Edge)"
    driverConfigBucket: null, // domain-gated to IEM
    awards: null, // "Reference Hi-Fi Headphones" is a model name, not an award
  },

  sourcing: [
    {
      field: "wearingStyle",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d7200/137175.html",
      quote: "Type: Over-Ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://audio46.com/products/denon-ah-d7200-reference-over-ear-headphones",
      quote:
        "Closed-Back (Audio46 product tag block; no manufacturer statement of open/closed exists on the Denon page, info sheet, or owner's manual)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d7200/137175.html",
      quote: "AH-D7200 Reference Hi-Fi Headphones — spec line: Type: Over-Ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d7200/137175.html",
      quote: "Active NC: No / Bluetooth: No — analog detachable cable only",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d7200/137175.html",
      quote:
        "(FLAG — inferred: Denon makes no portable/desktop claim for this model; recorded true on the same over-ear + detachable-cable basis as the sibling AH-D9200, which does cite a portable-playback cable)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "ah-d7200-owners-manual-global.pdf (Denon owner's manual, specifications)",
      quote: "Input impedance: 25 Ω/ohms",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "ah-d7200-owners-manual-global.pdf (Denon owner's manual, specifications)",
      quote: "Sensitivity: 105 dB/mW",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "ah-d7200-owners-manual-global.pdf (Denon owner's manual, specifications)",
      quote: "Playback frequency: 5 – 55,000 Hz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "ah-d7200-info-sheet-en.pdf (Denon info sheet)",
      quote: "Driver type: Dynamic (Nano-fibre/paper diaphragm + Free Edge)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "ah-d7200-info-sheet-en.pdf (Denon info sheet)",
      quote: "Detachable Cable: 3.0m 7N Purity Cable",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "ah-d7200-info-sheet-en.pdf (Denon info sheet)",
      quote: "Plug: 6.3 mm (Player), 3.5 mm x2 (headphones)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d7200/137175.html",
      quote:
        "A detachable 7N-purity copper cable, made in Japan to Denon's exacting specification, ensure the best possible signal transmission.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d7200/137175.html",
      quote: "Folding Mechanism: No (explicit manufacturer statement, not a feature-absence inference)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d7200/137175.html",
      quote:
        "(no microphone mentioned on the manufacturer page, info-sheet PDF, or owner's manual; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d7200/137175.html",
      quote:
        "Active NC: No (derived from the already-cited no-ANC statement + closed walnut housing — passive isolation only)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote:
        "Mid-centric — Generally weird and wonky tuning that can also get rather harsh at times. (Tone Grade C, Technical Grade D+)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
