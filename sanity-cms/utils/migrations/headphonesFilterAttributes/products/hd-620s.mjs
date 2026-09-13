// Sourced 2026-09-13 — see docs/filters-sort/sourced-headphones-sennheiser.md §2
// for the full per-field table this was transcribed from.
//
// The US store page renders as a JS shell for this model, so the manufacturer
// global/EOL page (sennheiser-hearing.com/p/hd-620s/) supplied the spec table.
// Note its spec labels differ slightly from the 600-series pages:
// "Nominal impedance", "Around ear", "Transducer principle (headphones)" — the
// values use the same vocabulary so they map 1:1.
//
// soundSignature is null — Crinacle, ASR and Rtings all have no measured entry
// (see the doc's exhaustion trail). NOT inferred from marketing copy.

export default {
  productId: "k27n1AQuIbSr5iozFz7GSn",
  brand: "Sennheiser",
  name: "HD 620S",
  beadsIssue: "sang-logium-1xs.9.2.2",

  filterAttributes: {
    productCategory: ["over-ear"],
    wearingStyle: ["over-ear"], // "Ear coupling: Around ear"
    acousticDesign: ["closed-back"],
    connectivity: "wired",
    portable: false, // 320 g circumaural reference headphone marketed for home listening
    driverType: ["dynamic"],
    impedanceOhms: 150, // "Nominal impedance: 150 Ohm ()"
    sensitivityDbMw: 110, // "Sound pressure level (SPL): 110 dB / 1 V RMS"
    freqResponseHz: { min: 6, max: 30000 }, // "Frequency response: 6 Hz - 30 kHz"
    cableTermination: ["3.5mm", "6.35mm"], // detachable cable; 6.3 mm adapter supplied
    detachableCable: true,
    cableLengthM: 1.8, // "Cable length: 1.8 m"
    microphone: false, // no manufacturer mention — boolean feature-absence rule
    foldable: false, // same rule
    // soundSignature intentionally omitted — no Tier 3 measured entry exists.
  },

  sourcing: [
    {
      field: "productCategory",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "Ear coupling: Around ear (over-ear form factor)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "impedanceOhms",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "Nominal impedance: 150 Ohm ()",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "sensitivityDbMw",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "Sound pressure level (SPL): 110 dB / 1 V RMS",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "freqResponseHz",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "Frequency response: 6 Hz - 30 kHz",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "driverType",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "Transducer principle (headphones): dynamic, closed",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableLengthM",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "Cable length: 1.8 m",
      tier: "hard-spec",
      sourcedAt: "2026-09-13",
    },
    {
      field: "wearingStyle",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "Ear coupling: Around ear",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "acousticDesign",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "Transducer principle (headphones): dynamic, closed",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "connectivity",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "wired closed-back headphone; no Bluetooth stated on the manufacturer page",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "cableTermination",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "detachable cable with 6.3 mm adapter listed among supplied accessories",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "detachableCable",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "detachable cable listed among supplied accessories",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "portable",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "320 g closed-back circumaural headphone marketed for home listening",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "microphone",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "(no mention across product page, press release, headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
    {
      field: "foldable",
      url: "https://sennheiser-hearing.com/p/hd-620s/",
      quote: "(no mention across product page, press release, headphones.com; boolean feature-absence rule applied)",
      tier: "marketing-fact",
      sourcedAt: "2026-09-13",
    },
  ],
};
