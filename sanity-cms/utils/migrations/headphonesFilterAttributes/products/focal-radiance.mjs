// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-focal.md
// (product 3) for the full per-field table and citation trails this was
// transcribed from.
//
// Radiance is discontinued: focal.com/products/radiance and
// focal.com/products/radiance-bentley return 404 live. The citations below are
// Focal's own published product sheet + user manual PDFs, retrieved from the
// Internet Archive — still a Tier-1/Tier-2 manufacturer source, not a
// retailer or press fallback.

export default {
  productId: "k27n1AQuIbSr5iozFz7E1H",
  brand: "Focal",
  name: "Radiance Limited Edition",
  beadsIssue: "sang-logium-1xs.9.5.3",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    fitType: null,
    connectivity: "wired",
    portable: true, // sheet: "For use at home and on the move"
    microphone: false, // absence-based per protocol's boolean feature-absence exception
    cableTermination: ["3.5mm", "6.35mm"],
    detachableCable: true,
    cableLengthM: 1.2,
    foldable: false, // FLAG — hard-shell case, no folding hinge; absence-based
    ipxRating: null,
    bluetoothCodecs: null, // domain-gated, wired-only
    anc: "none", // derived: closed-back passive isolation only, no electronics
    batteryLifeHours: { ancOff: null, ancOn: null },
    driverType: ["dynamic"],
    impedanceOhms: 35,
    sensitivityDbMw: 105,
    freqResponseHz: { min: 5, max: 23000 },
    awards: null,
    driverConfigBucket: null, // domain-gated to IEM
    driverConfigDetail: null,
    soundSignature: "Neutral", // Crinacle rankings list, Tone Grade B+, Technical B ("Harman neutral")
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "Impedance 35 Ohms",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "Sensitivity 105dB SPL / 1mW @ 1 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "Frequency response 5Hz – 23kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "Speaker driver 15/8\" Aluminium/Magnesium \"M\" shape dome",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "Cables supplied • 1 x 4ft. (1.2m) OFC 24 AWG cable with 1/8\" (3.5mm) unbalanced TRS jack connector",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "Type Circum-aural closed-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "Type Circum-aural closed-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "The Radiance headphones, under licence of Bentley Motors, complement the range of Focal closed-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "(only a detachable analog mini-jack cable supplied; no Bluetooth, ANC, or electronics anywhere on the sheet or manual)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "For use at home and on the move",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "1 x 4ft. (1.2m) OFC 24 AWG cable with 1/8\" (3.5mm) unbalanced TRS jack connector • 1 x jack adapter, 1/8\" (3.5mm) point socket – 1/4\" (6.35mm) point plug",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://web.archive.org/web/20211207080517if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/usermanual_radiance_85x200_web.pdf",
      quote: "you simply have to disconnect the cable and store it in the case",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "(no microphone language anywhere on the product sheet or user manual — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "(hard-shell carry case in the headphone colours provided; no folding hinge described — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "(derived from already-cited acousticDesign: closed-back + connectivity: wired — passive isolation only, no ANC electronics)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "Harman neutral — Probably the best of the closed-back Focals. Some tuning refinements over the Stellia, though technically limited. (Tone Grade B+, Technical Grade B)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://web.archive.org/web/20211207080622if_/https://www.focal.com/sites/www.focal.fr/files/shared/catalog/document/fp_radiance_en_0.pdf",
      quote: "(no battery anywhere on the sheet or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
