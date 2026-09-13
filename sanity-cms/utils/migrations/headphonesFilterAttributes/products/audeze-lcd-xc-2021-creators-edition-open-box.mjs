// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-audeze.md
// (product 4) for the full per-field table and citation trails this was
// transcribed from.

export default {
  productId: "k27n1AQuIbSr5iozFz7FkW",
  brand: "Audeze",
  name: "LCD-XC Headphones | 2021 Creator's Edition with Economy Travel Case - Open Box",
  beadsIssue: "sang-logium-1xs.9.7",

  filterAttributes: {
    // awards: null — page's only award-adjacent phrase ("Trusted by award
    //   winning artists and engineers") describes the product's users, not an
    //   award to the product.
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "wired",
    portable: false, // FLAG — 677 g closed-back + ">250mW" power; the included travel case is packaging, not a portability claim; see doc
    soundSignature: "Neutral", // Crinacle "Balanced" (sole Tier-3 source) → non-warm, non-bright
    impedanceOhms: 20,
    sensitivityDbMw: 100, // "100 dB/1mW (at Drum Reference Point)"; manual titles the same figure "Efficiency"
    freqResponseHz: { min: 10, max: 50000 },
    microphone: false, // no mic in spec table, package contents, or manual — boolean feature-absence rule
    cableTermination: ["6.35mm"], // stock cable is single-ended 1/4" — unlike the LCD-X's 4-pin XLR
    detachableCable: true, // manual has an explicit (L)/(R) attach/release procedure
    cableLengthM: 1.9, // "Cable 1.9m (6.2ft) length"
    foldable: false, // only headband-block adjustment described — boolean feature-absence rule
    // ipxRating: NULL — no IP claim anywhere; a spec a manufacturer may omit
    // bluetoothCodecs: NULL — domain-gated, wired-only
    anc: "passive", // derived: sealed closed-back cup gives passive isolation; no ANC electronics, wired-only
    batteryLifeHours: { ancOff: null, ancOn: null }, // wired-only, no battery (established wired-product convention)
    driverType: ["planar-magnetic"],
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://www.audeze.com/products/lcd-xc",
      quote: "Style Over-ear, closed-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://www.audeze.com/products/lcd-xc",
      quote: "Style Over-ear, closed-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.audeze.com/products/lcd-xc",
      quote:
        'Style Over-ear, closed-back / "LCD-XC Specifications Style: Closed-back circumaural" (LCD User Guide)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.audeze.com/products/lcd-xc",
      quote: "(analog cable only; no wireless mode anywhere in the specification table)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.audeze.com/products/lcd-xc",
      quote:
        'Weight 677 g / Recommended power level > 250mW / Cable 1.9m (6.2ft) length, Single ended 1/4" (6.3mm) termination — full-size closed-back studio headphone; the included "Economy Travel Case" is accessory packaging, not a manufacturer portability claim (absence-based FLAG)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote:
        '"Balanced" / "Definitely the least Audeze-sounding Audeze. A little quirky tonally, but nothing too offensive." (entry "Audeze LCD-XC", Tone Grade B-, Technical Grade A-)',
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://www.audeze.com/products/lcd-xc",
      quote:
        'Impedance 20 ohms / "LCD-XC Specifications ... Impedance: 20 ohms" (LCD User Guide — same-tier agreement)',
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://www.audeze.com/products/lcd-xc",
      quote:
        'Sensitivity 100 dB/1mW (at Drum Reference Point) / "Efficiency: 100dB / 1mW*" (LCD User Guide — same-tier agreement)',
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.audeze.com/products/lcd-xc",
      quote: "Frequency response 10Hz - 50kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://cdn.shopify.com/s/files/1/3013/1908/files/LCD_UserGuide_FULL_WEB_160222.pdf",
      quote:
        "(no microphone in the LCD-XC specification block, the package-contents list, or the manufacturer product page/spec table; boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.audeze.com/products/lcd-xc",
      quote: 'Cable 1.9m (6.2ft) length, Single ended 1/4" (6.3mm) termination',
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
      url: "https://www.audeze.com/products/lcd-xc",
      quote: 'Cable 1.9m (6.2ft) length, Single ended 1/4" (6.3mm) termination',
      tier: "hard-spec",
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
      url: "https://www.audeze.com/products/lcd-xc",
      quote:
        'Style Over-ear, closed-back / (no noise-cancelling feature listed; wired-only — derived from the already-cited acousticDesign + connectivity)',
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.audeze.com/products/lcd-xc",
      quote:
        "(no battery anywhere on the page or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.audeze.com/products/lcd-xc",
      quote:
        'Transducer type Planar Magnetic / Transducer size 106 mm / (LCD User Guide: "advanced planar magnetics enhanced with Fazor™ technology")',
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
  ],
};
