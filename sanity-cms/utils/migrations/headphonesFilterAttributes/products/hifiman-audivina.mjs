// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-hifiman.md
// (product 2) for the full per-field table and citation trails this was
// transcribed from.

export default {
  productId: "k27n1AQuIbSr5iozFz7KCz",
  brand: "HiFiMan",
  name: "Audivina",
  beadsIssue: "sang-logium-1xs.9.3",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "wired",
    portable: true, // manual: cables "suitable for most portable audio devices..." + Travel Bag included
    driverType: ["planar-magnetic"],
    impedanceOhms: 20,
    sensitivityDbMw: 97,
    freqResponseHz: { min: 5, max: 55000 },
    cableTermination: ["3.5mm", "6.35mm", "4-pin-xlr"], // all three cables ship in-box
    detachableCable: true,
    cableLengthM: 1.5, // shortest/SE cable per established convention (three cables in box)
    microphone: false, // no mic in 22-page guide or retailer pages — boolean feature-absence rule
    foldable: false, // only headband adjustment described; Travel Bag is packaging, not a folding claim
    anc: "passive", // derived: sealed closed-back cup provides passive isolation; no ANC electronics
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "Impedance: 20Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "Sensitivity: 97dB",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "Frequency Response: 5Hz-55kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "NEO Supernano Diaphragm (planar magnetic per manual)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "3.5mm single-end 1.5m cable x1, 6.35mm single-ended 3m cable x1, XLR balanced 3m cable x1",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "3.5mm single-end 1.5m cable x1, 6.35mm single-ended 3m cable x1, XLR balanced 3m cable x1",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "Closed-back badge + Acoustic Structure Specialized for Closed-back Design",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "The highly reliable socket ensures the contact resistance remains extremely low while having no effect on the signal path (swappable-cable system)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "Inbox companions include 3.5mm single-end cable, XLR balanced cable and 6.35mm single-end cable, which are suitable for most portable audio devices, mobile phones, PCs... + Headphone Travel Bag x1",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://headphones.com/products/hifiman-audivina-closed-back-headphones",
      quote: "Cup Style: Closed-Back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://headphones.com/products/hifiman-audivina-closed-back-headphones",
      quote: "Wearing Style: Over-ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://headphones.com/products/hifiman-audivina-closed-back-headphones",
      quote: "Connectivity: Wired",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://headphones.com/products/hifiman-audivina-closed-back-headphones",
      quote: "(derived — sealed closed-back cup provides passive isolation; no ANC electronics, wired-only)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "(no microphone language in full 22-page owner's guide or retailer pages — boolean feature-absence rule)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://hifiman.com/attachments/file/20230510/20230510094538_17805.pdf",
      quote: "(only headband-height adjustment described/pictured; Travel Bag is package contents, not a folding claim — absence-based FLAG)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};