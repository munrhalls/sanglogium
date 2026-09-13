// Sourced 2026-09-13 — see docs/filters-sort/headphones-dca-sourced.md §4
// for the full per-field table this was transcribed from.
//
// Live URL is https://danclarkaudio.com/noirex.html — the /noire-x.html and
// /headphones/noire-x.html patterns both 404 (confirmed this pass).
//
// Deliberately omitted (null, not written): freqResponseHz (manufacturer
// publishes the "Frequency response Yes, it has one" placeholder, no number),
// driverConfigBucket/Detail (IEM-only field), ipxRating, bluetoothCodecs,
// batteryLifeHours, awards (badge element only, no quotable attributed text).
//
// soundSignature is intentionally NOT written. Crinacle has no NOIRE X entry
// and ASR has no NOIRE X measurement thread — its DCA tag index returns only
// the unattributed user comparison thread, which the protocol excludes. null,
// never inferred from marketing copy or from its predecessor's Crinacle row.
//
// foldable: false is written deliberately, not omitted — the NOIRE X page
// carries no folding-hinge language at all (unlike Noire/Stealth/E3), so the
// protocol's boolean feature-absence rule makes silence read as false.

export default {
  productId: "n10eAegrGspodtsQvneQBQ",
  brand: "Dan Clark Audio",
  name: "NOIRE X",
  beadsIssue: "sang-logium-1xs.9.8",

  filterAttributes: {
    wearingStyle: ["over-ear"],
    acousticDesign: ["closed-back"],
    connectivity: "wired",
    portable: true,
    driverType: ["planar-magnetic"],
    impedanceOhms: 13,
    sensitivityDbMw: 90,
    cableTermination: ["3.5mm", "6.35mm", "4-pin-xlr", "4.4mm-balanced", "2.5mm-balanced"],
    detachableCable: true,
    cableLengthM: 2,
    microphone: false,
    foldable: false,
    anc: "passive",
  },

  sourcing: [
    {
      field: "impedanceOhms",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "Impedance 13ohms",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "Sensitivity ~90 dB/mW",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "NOIRE X is designed around an updated and improved AEON audio driver (Dan Clark Audio planar-magnetic line, V-Planar)",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "\"Choose Your Cable\" dropdown base no-upcharge option: 1/4\"-3.5mm 2m DUMMER",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "Self-Tensioning Headband / Our self-tensioning headband reduces listening fatigue by distributing pressure evenly across your head (circumaural over-ear)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "NOIRE X™ updates our iconic AEON 2 NOIRE by integrating DCA's state-of-the-art Acoustic Metamaterial Tuning System™ (AMTS™) with an improved driver (AEON 2 NOIRE is DCA's closed model, explicitly named as the product this updates)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "\"Choose Your Cable\" analog options only: 1/4\"-3.5mm, 4-pin XLR, 4.4mm, 2.5mm, 3.5mm (no wireless or Bluetooth feature stated anywhere on the page)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "offers a comprehensive range of cable terminations at the base price, including combo 1/4\" and 3.5mm tips, 4-pin XLR, and 4.4mm",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "it's easy to upgrade to our ultra-premium VIVO cables, which are available in multiple length and termination options",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "Travel friendly Packs Small!",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "(no microphone mentioned anywhere on the manufacturer page; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "(no folding-hinge or folding-gimbal language anywhere on the page — unlike Noire/Stealth/E3, which all state folding gimbals; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "anc",
      url: "https://danclarkaudio.com/noirex.html",
      quote: "closed-back design offering isolation; no electronic active noise cancelling feature stated",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
