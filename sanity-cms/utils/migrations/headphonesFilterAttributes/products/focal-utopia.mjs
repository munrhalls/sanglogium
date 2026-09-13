// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-focal.md
// (product 1) for the full per-field table and citation trails this was
// transcribed from.
//
// Two-Utopia-records note: this Sanity doc and PHPYj28HJdPDHAaIBADqsm
// ("Utopia 2022") are the same Focal SKU at the same price. Both are sourced
// identically from Focal's single current Utopia page/manual — see the doc's
// section 8 for the flag.

export default {
  productId: "moXlkADK7m1DHgGwWtUHWs",
  brand: "Focal",
  name: "Utopia",
  beadsIssue: "sang-logium-1xs.9.5.1",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"],
    fitType: null,
    connectivity: "wired",
    portable: false, // FLAG — reference open-back; no portability language on page or manual
    microphone: false, // absence-based per protocol's boolean feature-absence exception
    cableTermination: ["3.5mm", "6.35mm", "4-pin-xlr"], // supplied plug ends + 6.35mm adapter; cup side is LEMO (outside vocab)
    detachableCable: true,
    cableLengthM: 1.5, // stock 3.5mm cable; 3m XLR cable also supplied
    foldable: false, // FLAG — no folding hinge described; absence-based
    ipxRating: null,
    bluetoothCodecs: null, // domain-gated, wired-only
    anc: "none", // derived: open-back + wired, no electronics
    batteryLifeHours: { ancOff: null, ancOn: null },
    driverType: ["dynamic"],
    impedanceOhms: 80,
    sensitivityDbMw: 104, // manual basis (dB SPL / 1mW @ 1kHz); web page only claims peak SPL
    freqResponseHz: { min: 5, max: 23000 }, // live page; manual's 5Hz-50kHz superseded (CONFLICT-resolved)
    awards: null,
    driverConfigBucket: null, // domain-gated to IEM
    driverConfigDetail: null,
    soundSignature: "Neutral", // Crinacle rankings list, Tone Grade S-, Technical S-
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://www.focal.com/products/utopia",
      quote: "Impedance : 80 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://www.focal.com/products/utopia",
      quote: "Frequency response (+/- 3dB) : 5 Hz – 23 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://www.focal.com/products/utopia",
      quote: "Loudspeakers : 15/8\" (40mm) pure Beryllium ‘M’-shaped dome",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://www.focal.com/products/utopia",
      quote: "Cables provided : • 1 x 5ft (1.5m) Jack 1/8\" (3.5mm) cable with Lemo® connectors • 1 x 10ft (3m) 4-pin XLR cable with Lemo® connectors",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://dam.focal-naim.com/m/75168348b21e34b6/original/UserManual_Utopia_74x200_Web-pdf.pdf",
      quote: "Sensitivity 104dB SPL / 1mW @ 1kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://www.focal.com/products/utopia",
      quote: "Product type : Open-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://www.focal.com/products/utopia",
      quote: "Circum-aural open-back headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://www.focal.com/products/utopia",
      quote: "Reference open-back hi-fi headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://www.focal.com/products/utopia",
      quote: "Cables provided (LEMO® 3.5mm / 4-pin XLR) — no Bluetooth, ANC, or electronics anywhere on the page",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://www.focal.com/products/utopia",
      quote: "1 x 5ft (1.5m) Jack 1/8\" (3.5mm) cable • 1 x 10ft (3m) 4-pin XLR cable • 1 x Jack adapter, 1/8\" (3.5mm) point socket – 1/4\" (6.35mm) point plug",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://dam.focal-naim.com/m/75168348b21e34b6/original/UserManual_Utopia_74x200_Web-pdf.pdf",
      quote: "To disconnect the cable from the headphones, hold the ends of the cable by the \"grip\" (fig.2) to unlock the",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://www.focal.com/products/utopia",
      quote: "(no portability or travel language anywhere on page or in manual — absence-based FLAG; reference open-back home headphone)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://dam.focal-naim.com/m/75168348b21e34b6/original/UserManual_Utopia_74x200_Web-pdf.pdf",
      quote: "(no microphone language anywhere in page or manual — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://dam.focal-naim.com/m/75168348b21e34b6/original/UserManual_Utopia_74x200_Web-pdf.pdf",
      quote: "(only headband/yoke adjustment and a hard carrying case described; no folding hinge — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://www.focal.com/products/utopia",
      quote: "(derived: no electronics anywhere on the page — supplied cables are LEMO® 3.5mm and 4-pin XLR, no Bluetooth/ANC)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "batteryLifeHours",
      url: "https://www.focal.com/products/utopia",
      quote: "(no battery anywhere on the page or manual — wired-only passive headphone, so both ancOn and ancOff are null)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote: "Neutral — Solid tuning with close to top-tier resolution. An inoffensive all-rounder that lives up to its reputation. (Tone Grade S-, Technical Grade S-)",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
  ],
};
