// Sourced 2026-09-13 — see docs/filters-sort/meze-audio-sourced.md (product 3)
// for the per-field table, quotes and full citation trail this was transcribed from.
// Hardware-identical to product 1 (LIRIC II); this is the open-box variant.

export default {
  productId: "k27n1AQuIbSr5iozFz7KdY",
  brand: "Meze Audio",
  name: "LIRIC II",
  beadsIssue: "sang-logium-1xs.9.9",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"], // "Ear Coupling: Circumaural"
    acousticDesign: ["closed-back"], // "Operating Principle: Closed-back"
    connectivity: "wired",
    // portable: omitted — no explicit manufacturer portable/desktop claim
    // awards:   omitted — none found for this SKU
    microphone: false, // boolean feature-absence rule
    cableTermination: ["4.4mm-balanced", "3.5mm"], // 1.3 m 4.4mm + 3 m 3.5mm both supplied
    detachableCable: true, // "Input Connector: Dual 3.5 mm TS Jack" + two interchangeable cables
    cableLengthM: 1.3, // two cables supplied (1.3 m / 3 m) — single-value-schema gap
    driverType: ["planar-magnetic"], // "Rinaro Isodynamic Hybrid Array® MZ4"
    impedanceOhms: 61,
    sensitivityDbMw: 100, // "100 dB SPL/mW at 1 kHz"
    freqResponseHz: { min: 4, max: 92000 },
    // soundSignature: omitted — no Crinacle/ASR/Rtings measurement for the LIRIC II
  },

  sourcing: [
    {
      field: "driverType",
      url: "https://mezeaudio.com/products/liric",
      quote: "Driver Type: Rinaro Isodynamic Hybrid Array® MZ4",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://mezeaudio.com/products/liric",
      quote: "Operating Principle: Closed-back",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://mezeaudio.com/products/liric",
      quote: "Ear Coupling: Circumaural",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://mezeaudio.com/products/liric",
      quote: "Impedance: 61 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://mezeaudio.com/products/liric",
      quote: "Sensitivity: 100 dB SPL/mW at 1 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://mezeaudio.com/products/liric",
      quote: "Frequency Range: 4 Hz - 92 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://mezeaudio.com/products/liric",
      quote:
        "WHAT COMES WITH YOUR HEADPHONES: 1.3 m braided Furukawa PCUHD copper cable with 4.4 mm jack and 3 m soft TPE cable with 3.5 mm jack",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://mezeaudio.com/products/liric",
      quote: "Input Connector: Dual 3.5 mm TS Jack",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://mezeaudio.com/products/liric",
      quote: "1.3 m braided Furukawa PCUHD copper cable with 4.4 mm jack",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://mezeaudio.com/products/liric",
      quote: "Meze Audio LIRIC II — closed-back hybrid array planar magnetic headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://audio46.com/products/meze-liric-ii-closed-back-hybrid-array-planar-magnetic-headphones",
      quote: "WIRED HEADPHONE / Closed-Back / over-ear / planar magnetic",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://mezeaudio.com/products/liric",
      quote:
        "No microphone mentioned on the manufacturer page, manual or press release — boolean feature-absence rule reads silence as false",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
