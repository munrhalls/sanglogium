// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-denon.md §1
// for the full per-field table this was transcribed from.
//
// Denon's live AH-D9200 product page carries no prose spec block beyond a
// short bullet list, so the H-tier numbers here come from the owner's-manual
// PDF (impedance / sensitivity / frequency response / cable lengths /
// termination / "Dynamic type" driver principle) and the info-sheet PDF
// (portable-playback claim). The live page confirms all of them verbatim.
//
// acousticDesign has no manufacturer wording on this product at all — Denon
// publishes numbers, not a design description. It is sourced from the
// audited-retailer tier (Audio46's product tag block) and is FLAGged as such
// in the doc. The superseded pre-migration siblings on the document
// (backDesign / connector / noiseCancelling) are intentionally left
// untouched, same convention as the HD 600 patch (sang-logium-1xs.9.2.9).

export default {
  productId: "moXlkADK7m1DHgGwWtbmis",
  brand: "Denon",
  name: "AHD9200 Headphones",
  beadsIssue: "sang-logium-1xs.9.12",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"], // FLAG — retailer-tier; manufacturer page never states it
    fitType: null, // not an IEM
    connectivity: "wired",
    portable: true, // "1.3m audio cable with 3.5mm plug — enjoy with portable music players"
    soundSignature: "Mid-Forward", // Crinacle "Mid-centric" — closest enum member, see doc gap 2
    impedanceOhms: 24,
    sensitivityDbMw: 105, // "105 dB/mW"
    freqResponseHz: { min: 5, max: 56000 },
    microphone: false, // no manufacturer mention — boolean feature-absence rule
    cableTermination: ["3.5mm", "6.35mm"], // two supplied cables: 1.3m/3.5mm and 3.0m/6.3mm
    detachableCable: true, // "The detachable cables and luxury case…"
    cableLengthM: 3, // "3.0 m × 1, 1.3 m × 1" — primary/full-length cable recorded
    foldable: false, // same feature-absence rule
    ipxRating: null, // no manufacturer IP claim
    bluetoothCodecs: null, // wired-only
    anc: "passive", // "Noise Canceling Type: None" + closed wood housing — no ANC electronics
    batteryLifeHours: null, // wired-only
    driverType: ["dynamic"], // manual: "Type: Dynamic type"; FreeEdge is the diaphragm tech
    driverConfigBucket: null, // domain-gated to IEM
    awards: null, // no award naming this SKU specifically
  },

  sourcing: [
    {
      field: "wearingStyle",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d9200/137241.html",
      quote: "Flagship over-ear headphones / Driver Diameter 50 mm / Wired Over-Ear Headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://audio46.com/products/denon-ah-d9200-premium-over-ear-headphones",
      quote:
        "Closed-Back (Audio46 product tag block; no manufacturer statement of open/closed exists on the Denon page, info sheet, or owner's manual)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d9200/137241.html",
      quote: "AH-D9200 Flagship Hi-Fi Headphones — product type: Wired Over-Ear Headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d9200/137241.html",
      quote: "Battery Life: Wired; no Bluetooth / wireless section present",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "ah-d9200-info-sheet-en.pdf (Denon info sheet)",
      quote:
        "A 1.3m audio cable with 3.5mm plug — Enjoy your headphones with portable music players",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "ah-d9200-owners-manual-global.pdf (Denon owner's manual, specifications)",
      quote: "Input impedance: 24 Ω/ohms",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "ah-d9200-owners-manual-global.pdf (Denon owner's manual, specifications)",
      quote: "Sensitivity: 105 dB/mW",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "ah-d9200-owners-manual-global.pdf (Denon owner's manual, specifications)",
      quote: "Playback frequency: 5 – 56,000 Hz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "ah-d9200-owners-manual-global.pdf (Denon owner's manual, specifications)",
      quote:
        'Type: Dynamic type / Drive units: Ø 50 mm (live page\'s "Driver Type: Nanofiber FreeEdge" is the diaphragm technology name, not a driver principle)',
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "ah-d9200-owners-manual-global.pdf (Denon owner's manual, specifications)",
      quote: "Cable length: 3.0 m × 1, 1.3 m × 1",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "ah-d9200-owners-manual-global.pdf (Denon owner's manual, specifications)",
      quote:
        "Plug (3.0 m cable): Ø 6.3 mm (Player) – Ø 3.5 mm x 2 (Headphone); Plug (1.3 m cable): Ø 3.5 mm (Player) – Ø 3.5 mm x 2 (Headphone), Ø 6.3 mm Adapter",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d9200/137241.html",
      quote:
        "The detachable cables and luxury case for storage ensure the AH-D9200 headphones provide superior sound and comfort for years to come.",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d9200/137241.html",
      quote:
        "(no microphone mentioned on the manufacturer page, info-sheet PDF, or owner's manual; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d9200/137241.html",
      quote:
        "(no folding/hinge claim on the manufacturer page, info-sheet PDF, or owner's manual; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.denon.com/en-us/product/over-ear-headphones/ah-d9200/137241.html",
      quote:
        "Noise Canceling Type: None (derived from the already-cited no-ANC statement + closed-back sealed wood housing — passive isolation only)",
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
