// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-audeze.md
// (product 5) for the full per-field table and citation trails this was
// transcribed from.

export default {
  productId: "PHPYj28HJdPDHAaIBAJiLG",
  brand: "Audeze",
  name: "LCD-2 Classic Headphones",
  beadsIssue: "sang-logium-1xs.9.7",

  filterAttributes: {
    awards: ['The Switch Master — "Editor\'s Choice award"'],
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    connectivity: "wired",
    portable: false, // FLAG — 544 g open-back + ">250mW" recommended power; no portability/case language; see doc
    soundSignature: "Warm", // Crinacle rankings list: "Warm"
    impedanceOhms: 70,
    sensitivityDbMw: 101, // "101 dB/1mW (at Drum Reference Point)"; manual titles the same figure "Efficiency"
    freqResponseHz: { min: 10, max: 50000 },
    microphone: false, // no mic in spec table, package contents, or manual — boolean feature-absence rule
    cableTermination: ["4-pin-xlr", "6.35mm"], // current product page lists a 4-pin XLR cable + 1/4" adapter as included
    detachableCable: true, // cables are separate package items; manual documents attach/release
    // cableLengthM: NULL — cables named with no length on the page or in the manual.
    foldable: false, // only headband-block adjustment described — boolean feature-absence rule
    // ipxRating: NULL — no IP claim anywhere; a spec a manufacturer may omit
    // bluetoothCodecs: NULL — domain-gated, wired-only
    anc: "none", // derived: open-back passive design, no ANC electronics, wired-only
    batteryLifeHours: { ancOff: null, ancOn: null }, // wired-only, no battery (established wired-product convention)
    driverType: ["planar-magnetic"],
  },

  sourcing: [
    {
      field: "awards",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote:
        '"Editor\'s Choice award. It\'s one of the best models that Audeze have ever made...for under a grand, nothing sounds as good." - The Switch Master',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote: "Style Over-ear, open-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote: "Style Over-ear, open-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote:
        'Style Over-ear, open-back / "LCD-2 Specifications Style: Open-back circumaural" (LCD User Guide)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote: "(analog cable only; no wireless mode anywhere in the specification table)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote:
        'Weight 544g / Recommended power level >250mW — full-size open-back headphone; no portability or desktop-use statement from the manufacturer (absence-based FLAG)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote:
        '"Warm" / "Classic Audeze combo of solid resolution with a confusing lack of upper midrange." (entry "Audeze LCD-2 Classic", $800, Tone Grade C, Technical Grade A)',
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote:
        'Impedance 70 ohms / "LCD-2 Specifications ... Impedance: 70 ohms" (LCD User Guide — same-tier agreement)',
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote:
        'Sensitivity 101 dB/1mW (at Drum Reference Point) / "Efficiency: 101dB / 1mW*" (LCD User Guide — same-tier agreement)',
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote: "Frequency response 10Hz - 50kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://cdn.shopify.com/s/files/1/3013/1908/files/LCD_UserGuide_FULL_WEB_160222.pdf",
      quote:
        "(no microphone in the LCD-2 specification block, the package-contents list, or the manufacturer product page/spec table; boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote:
        'Includes: LCD-2 Classic Headphone | Standard LCD Travel Case | 4-pin XLR Cable | 4-pin XLR to 1/4" TRS adapter cable | 1/4" to 3.5mm adapter | Warranty Card and Certificate of Authenticity',
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
      field: "foldable",
      url: "https://cdn.shopify.com/s/files/1/3013/1908/files/LCD_UserGuide_FULL_WEB_160222.pdf",
      quote:
        "(no folding/collapsing hinge in the structure or comfort sections, and none in the manufacturer spec table; boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote:
        'Style Over-ear, open-back / (no noise-cancelling feature listed; wired-only — derived from the already-cited acousticDesign + connectivity)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote:
        "(no battery anywhere on the page or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.audeze.com/products/lcd-2-classic",
      quote:
        'Transducer type Planar Magnetic / Magnetic structure Proprietary magnet array / Transducer size 106 mm / (LCD User Guide: "advanced planar magnetics")',
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
  ],
};
