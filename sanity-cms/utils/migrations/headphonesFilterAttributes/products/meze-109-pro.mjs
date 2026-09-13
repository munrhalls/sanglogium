// Sourced 2026-09-13 — see docs/filters-sort/meze-audio-sourced.md (product 4)
// for the per-field table, quotes and full citation trail this was transcribed from.
// Open-back 50 mm dynamic over-ear, wired-only: wireless/IEM-domain fields omitted.

export default {
  productId: "PHPYj28HJdPDHAaIBAJqcI",
  brand: "Meze Audio",
  name: "109 PRO",
  beadsIssue: "sang-logium-1xs.9.9",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"],
    acousticDesign: ["open-back"], // "High-Fidelity Premium Open-Back Dynamic Driver Headphones"
    connectivity: "wired",
    portable: false, // 375 g open-back; no transport case in the manufacturer's in-box list
    // awards: omitted — reviewer superlatives hosted as marketing quotes are not a
    //          dated named award conferred on this SKU
    microphone: false, // boolean feature-absence rule
    cableTermination: ["3.5mm"], // 6.3 mm in-box item is an adapter, not a termination
    detachableCable: true, // two cables ship in-box; cables also sold separately
    cableLengthM: 1.5, // two cables supplied (1.5 m / 3 m) — single-value-schema gap
    foldable: false, // no folding/hinge/collapse language anywhere on the manufacturer page
    driverType: ["dynamic"],
    impedanceOhms: 40, // "Impedance | 40 Ω"
    sensitivityDbMw: 112, // "Sensitivity | 112 dB SPL/mW at 1 kHz"
    freqResponseHz: { min: 5, max: 30000 }, // "Frequency Range | 5 Hz - 30 kHz"
    // soundSignature: omitted — no Crinacle/ASR/Rtings measurement for the 109 PRO
  },

  sourcing: [
    {
      field: "driverType",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "Driver Type | Dynamic",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "Meze Audio 109 PRO - High-Fidelity Premium Open-Back Dynamic Driver Headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "Impedance | 40 Ω",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "Sensitivity | 112 dB SPL/mW at 1 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "Frequency Range | 5 Hz - 30 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://mezeaudio.com/products/109-pro",
      quote:
        "WHAT COMES WITH YOUR HEADPHONES | 1.5 m & 3m soft TPE cable, with 3.5 mm jack | PU leather pouch | 6.3 mm gold-plated jack adapter | Hard EVA carrying pouch",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "Input Connector | dual 3.5 mm TS Jack",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "1.5 m & 3m soft TPE cable, with 3.5 mm jack",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://mezeaudio.com/products/109-pro",
      quote:
        "No folding/hinge/collapse language anywhere on the manufacturer page — boolean feature-absence rule reads silence as false",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://mezeaudio.com/products/109-pro",
      quote:
        "No microphone mentioned on the manufacturer page, manual or press release — boolean feature-absence rule reads silence as false",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "Weight | 375 g (13 oz.) — no transport case supplied, only a cable pouch",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "Ear Coupling: Circumaural / over-ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://mezeaudio.com/products/109-pro",
      quote: "109 PRO | Open-Back Dynamic Headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://bloomaudio.com/products/meze-109-pro",
      quote:
        "Meze Audio 109 PRO Headphones — no wireless/Bluetooth/battery mention on any manufacturer or audited-retailer source",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
