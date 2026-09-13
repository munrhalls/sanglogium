// Sourced 2026-09-13 — see docs/filters-sort/headphones-dca-sourced.md §3
// for the full per-field table this was transcribed from.
//
// Catalogue record is the Open Box listing of the same E3 model; the model
// itself was sourced from the manufacturer page, not from the listing.
//
// Deliberately omitted (null, not written): freqResponseHz (manufacturer
// publishes the "Frequency response Yes, it has one" placeholder, no number),
// driverConfigBucket/Detail (IEM-only field), ipxRating, bluetoothCodecs,
// batteryLifeHours, awards (badge element only, no quotable attributed text).
//
// soundSignature is intentionally NOT written. Crinacle has no E3 entry at all
// and ASR has no E3 measurement thread (both verified by direct enumeration
// this pass) — the protocol says null, never inferred from marketing copy.

export default {
  productId: "moXlkADK7m1DHgGwWtbkq7",
  brand: "Dan Clark Audio",
  name: "E3",
  beadsIssue: "sang-logium-1xs.9.8",

  filterAttributes: {
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "wired",
    portable: true,
    driverType: ["planar-magnetic"],
    impedanceOhms: 27,
    sensitivityDbMw: 90,
    cableTermination: ["3.5mm", "6.35mm", "4-pin-xlr", "4.4mm-balanced", "2.5mm-balanced"],
    detachableCable: true,
    cableLengthM: 2,
    microphone: false,
    foldable: true,
    anc: "passive",
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://danclarkaudio.com/e3.html",
      quote: "Impedance 27ohms",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://danclarkaudio.com/e3.html",
      quote: "Sensitivity ~90 dB/mW",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://danclarkaudio.com/e3.html",
      quote: "all-new 5th generation driver and our pioneering Acoustic Metamaterial Tuning System, or AMTS (Dan Clark Audio planar-magnetic line)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://danclarkaudio.com/e3.html",
      quote: "\"Choose Your Cable\" dropdown base no-upcharge option: 2m 1/4\" VIVO",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://danclarkaudio.com/e3.html",
      quote: "E3 is our midrange closed-back headphone (circumaural, DCA signature self-adjusting headband)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://danclarkaudio.com/e3.html",
      quote: "E3 is Dan Clark Audio's revolutionary new closed-back headphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://danclarkaudio.com/e3.html",
      quote: "\"Choose Your Cable\" analog options only: 1/4\", XLR, 4.4mm, 2.5mm, 3.5mm (no wireless or Bluetooth feature stated anywhere on the page)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://danclarkaudio.com/e3.html",
      quote: "\"Choose Your Cable\" options: 1/4\", XLR (4-pin), 4.4mm, 2.5mm, 3.5mm",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://danclarkaudio.com/e3.html",
      quote: "\"Choose Your Cable\" dropdown offering interchangeable 1/4\", XLR, 4.4mm, 2.5mm and 3.5mm cables (DCA's push-pull self-latching inline connector system across its planar-magnetic line)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://danclarkaudio.com/e3.html",
      quote: "Travel friendly Packs Small! / convenient and stylish folding gimbals that make E3 a conveniently compact travel headphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://danclarkaudio.com/e3.html",
      quote: "convenient and stylish folding gimbals that make E3 a conveniently compact travel headphone",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://danclarkaudio.com/e3.html",
      quote: "(no microphone mentioned anywhere on the manufacturer page; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://danclarkaudio.com/e3.html",
      quote: "closed-back headphone design offering isolation; no electronic active noise cancelling feature stated",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
