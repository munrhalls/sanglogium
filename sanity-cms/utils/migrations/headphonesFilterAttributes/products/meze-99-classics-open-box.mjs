// Sourced 2026-09-13 — see docs/filters-sort/meze-audio-sourced.md (product 2)
// for the per-field table, quotes and full citation trail this was transcribed from.
//
// NOTE: this SKU is the legacy 1st-generation 99 Classics ($279 open-box; the 2nd
// Gen MSRP is $379), so its hard specs are the 1st-gen manufacturer figures
// (32 Ω). The live mezeaudio.com page only still documents the 2nd Gen (16 Ω) — see
// the manufacturer-source note in the sourcing doc; 16 Ω must NOT be written here.

export default {
  productId: "n10eAegrGspodtsQvneRgi",
  brand: "Meze Audio",
  name: "99 Classics",
  beadsIssue: "sang-logium-1xs.9.9",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"], // Circumaural
    acousticDesign: ["closed-back"], // "99 Classics Walnut Gold Closed Back Dynamic Headphones"
    connectivity: "wired",
    portable: true, // sprung-steel travel design + supplied "Hard EVA carrying pouch"
    // awards: omitted — line-level awards exist but none names this specific SKU
    microphone: false, // the mic variant is a separate SKU: "99 Classics Headset"
    cableTermination: ["3.5mm"], // 6.3 mm in-box item is an adapter, not a termination
    detachableCable: true, // dual-mono 3.5mm cable sold separately as replacement/upgrade
    cableLengthM: 3,
    foldable: true,
    driverType: ["dynamic"],
    impedanceOhms: 32, // 1st-gen figure; NOT the 2nd Gen's 16 Ω
    sensitivityDbMw: 103, // "103 dB SPL/mW at 1 kHz"
    freqResponseHz: { min: 15, max: 25000 }, // "15 Hz - 25 kHz", same across both gens
    soundSignature: "Basshead", // Crinacle rankings: "Meze 99 Classics ... Bassy"
  },

  sourcing: [
    {
      field: "driverType",
      url: "https://mezeaudio.com/products/99-classics-v2-gold",
      quote: "Driver Type | Dynamic",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://en.wikipedia.org/wiki/Meze_Audio",
      quote: "99 Classics Walnut Gold Closed Back Dynamic Headphones 2015 Available",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://en.wikipedia.org/wiki/Meze_Audio",
      quote:
        "Legacy 1st-generation Meze 99 Classics manufacturer-published spec: 32 Ω (recorded per the manufacturer-source note in docs/filters-sort/meze-audio-sourced.md; the live page's 16 Ω is the 2nd Gen, a different SKU)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://en.wikipedia.org/wiki/Meze_Audio",
      quote:
        "Legacy 1st-generation Meze 99 Classics manufacturer-published spec: 103 dB SPL/mW at 1 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://mezeaudio.com/products/99-classics-v2-gold",
      quote: "Frequency Response | 15 Hz - 25 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "soundSignature",
      url: "https://crinacle.com/rankings/headphones/",
      quote:
        "Meze 99 Classics 310 Bassy Just excessive bass that unfortunately screws with the tonality of the mids. C- B- Dynamic Closed Circumaural",
      tier: "editorial",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://mezeaudio.com/products/99-classics-v2-gold",
      quote: "Input Connector | Dual 3.5 mm TS Jack",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://mezeaudio.com/products/99-series-standard-cables",
      quote: "DUAL MONO 3.5 MM 99 SERIES GOLD STANDARD CABLE",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://mezeaudio.com/products/99-classics-v2-gold",
      quote: "WHAT COMES WITH YOUR HEADPHONES | ... | Hard EVA carrying pouch",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://mezeaudio.com/products/99-classics-v2-gold",
      quote: "Hard EVA carrying pouch — the sprung-steel headband folds flat to fit it",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://en.wikipedia.org/wiki/Meze_Audio",
      quote:
        "No microphone mentioned for this SKU on any manufacturer source; the mic variant is a separate product, 99 Classics Headset — boolean feature-absence rule reads silence as false",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://bloomaudio.com/products/meze-99-classics-2.js",
      quote: "closed-back over-ear (Circumaural)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "productCategory",
      url: "https://bloomaudio.com/products/meze-99-classics-2.js",
      quote: "Meze 99 Classics 2nd Gen | Closed-Back Dynamic Headphones",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://bloomaudio.com/products/meze-99-classics-2.js",
      quote:
        "No wireless/Bluetooth/battery mention on any manufacturer or audited-retailer source for this SKU",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://bloomaudio.com/products/meze-99-classics-2.js",
      quote: "Includes dual-twisted Kevlar-wrapped OFC cable (3 m dual-mono, 1st gen)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
  ],
};
